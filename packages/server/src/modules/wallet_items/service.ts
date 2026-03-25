import { db } from "@/lib/prisma";
import type { TWalletItemCreate, TWalletItemUpdate } from "./model";
import { Decimal } from "@prisma/client/runtime/client";
import {
  paginate,
  TPaginationQuery,
  TParamsQuery,
  TWalletItemFilterQuery,
} from "@/models/response";
import { checkWalletAccess, checkWalletItem } from "@/lib/wallet";

export const createWalletItem = async (
  data: TWalletItemCreate,
  wallet_id: string,
  user_id: string,
) => {
  await checkWalletAccess(wallet_id, user_id);

  // parse to decimal for prisma
  // add if income, subtract if expense
  const amount = new Decimal(data.amount);
  const balanceDelta = data.type === "INCOME" ? amount : amount.negated();

  const [item] = await db.$transaction([
    db.walletItem.create({
      data: { ...data, wallet_id },
    }),
    db.wallet.update({
      where: { id: wallet_id },
      data: { balance: { increment: balanceDelta } },
    }),
  ]);

  return item;
};

export const updateWalletItem = async (
  data: TWalletItemUpdate,
  item_id: string,
  wallet_id: string,
  user_id: string,
) => {
  await checkWalletAccess(wallet_id, user_id);

  const existing = await checkWalletItem(wallet_id, item_id);

  const oldAmount = new Decimal(existing.amount);
  const newAmount = new Decimal(data.amount ?? existing.amount);
  const oldType = existing.type;
  const newType = data.type ?? existing.type;

  // undo the old effect then apply the updated item
  const oldDelta = oldType === "INCOME" ? oldAmount : oldAmount.negated();
  const newDelta = newType === "INCOME" ? newAmount : newAmount.negated();
  const balanceChange = newDelta.minus(oldDelta);

  const [item] = await db.$transaction([
    db.walletItem.update({ where: { id: item_id }, data }),
    db.wallet.update({
      where: { id: wallet_id },
      data: { balance: { increment: balanceChange } },
    }),
  ]);

  return item;
};

export const deleteWalletItem = async (
  item_id: string,
  wallet_id: string,
  user_id: string,
) => {
  await checkWalletAccess(wallet_id, user_id);
  const existing = await checkWalletItem(wallet_id, item_id);
  const amount = new Decimal(existing.amount);
  const delta = existing.type === "INCOME" ? amount.negated() : amount;

  await db.$transaction([
    db.walletItem.delete({ where: { id: item_id } }),
    db.wallet.update({
      where: { id: wallet_id },
      data: { balance: { increment: delta } },
    }),
  ]);
};

export const getWalletItems = async (
  user_id: string,
  wallet_id: string,
  params: TParamsQuery & TPaginationQuery & TWalletItemFilterQuery,
) => {
  await checkWalletAccess(wallet_id, user_id);

  const {
    page = 1,
    limit = 10,
    search,
    filter,
    sort = "desc",
    sortBy = "created_at",
  } = params;
  const skip = (page - 1) * limit;

  const where = {
    wallet_id,
    ...(search ? { note: { contains: search } } : {}),
    ...(filter ? { type: filter } : {}),
  };

  const [items, total] = await Promise.all([
    db.walletItem.findMany({
      where,
      orderBy: { [sortBy]: sort },
      skip,
      take: limit,
    }),
    db.walletItem.count({ where }),
  ]);

  const paginated = paginate(items, total, page, limit);

  return {
    items: paginated.items,
    meta: {
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
      total_pages: paginated.total_pages,
    },
  };
};
