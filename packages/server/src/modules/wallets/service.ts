import { db } from "@/lib/prisma";
import type { TWalletCreate, TWalletUpdate } from "./model";
import { paginate, TPaginationQuery, TParamsQuery } from "@/models/response";
import { checkWalletAccess } from "@/lib/wallet";

export const createWallet = async (data: TWalletCreate, user_id: string) => {
  const existing = await db.wallet.findUnique({
    where: { name: data.name },
  });

  if (existing) throw new Error("Wallet name must be unique");

  return await db.wallet.create({
    data: {
      name: data.name,
      balance: data.balance,
      color: data.color,
      is_archived: data.is_archived,
      user: {
        connect: { id: user_id },
      },
    },
  });
};

export const updateWallet = async (
  data: TWalletUpdate,
  wallet_id: string,
  user_id: string,
) => {
  await checkWalletAccess(wallet_id, user_id);

  return await db.wallet.update({
    where: { id: wallet_id },
    data,
  });
};

export const deleteWallet = async (wallet_id: string, user_id: string) => {
  await checkWalletAccess(wallet_id, user_id);

  return await db.wallet.delete({ where: { id: wallet_id } });
};

export const getWallet = async (wallet_id: string, user_id: string) => {
  const wallet = await checkWalletAccess(wallet_id, user_id);

  return wallet;
};

export const getWallets = async (
  user_id: string,
  params: TParamsQuery & TPaginationQuery,
) => {
  const {
    page = 1,
    limit = 10,
    search,
    sort = "desc",
    sortBy = "created_at",
  } = params;
  const skip = (page - 1) * limit;

  const where = {
    user_id,
    ...(search && { OR: [{ name: { contains: search } }] }),
  };

  const [wallets, total] = await Promise.all([
    db.wallet.findMany({
      where,
      orderBy: { [sortBy]: sort },
      omit: {
        user_id: true,
      },
      skip,
      take: limit,
    }),
    db.wallet.count({ where }),
  ]);

  const paginated = paginate(wallets, total, page, limit);

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
