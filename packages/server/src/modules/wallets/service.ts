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
  const wallet = await checkWalletAccess(wallet_id, user_id);

  if (data.name !== undefined) {
    const existing = await db.wallet.findFirst({
      where: {
        user_id,
        name: data.name,
        NOT: { id: wallet_id },
      },
    });

    if (existing) throw new Error("Wallet name must be unique");
  }

  // Case: wallet balance is updated by user. It should recompute with the items already in
  // the wallet. It should not reset to the updated input of the user.

  const { balance: targetBalance, ...rest } = data;

  // Update non-balance fields only
  const updated = await db.wallet.update({
    where: { id: wallet_id },
    data: rest,
  });

  if (targetBalance === undefined || targetBalance === wallet.balance) {
    return updated;
  }

  const delta = targetBalance - wallet.balance!;

  // Create adjustment item (positive and negative deltas)
  await db.walletItem.create({
    data: {
      wallet_id,
      type: delta > 0 ? "INCOME" : "EXPENSE",
      amount: Math.abs(delta),
      note: "Balance adjustment",
      date: new Date(),
    },
  });

  // Recompute balance from all items
  const items = await db.walletItem.findMany({ where: { wallet_id } });
  const recomputed = items.reduce(
    (acc, item) =>
      item.type === "INCOME" ? acc + item.amount : acc - item.amount,
    0,
  );

  return await db.wallet.update({
    where: { id: wallet_id },
    data: { balance: recomputed },
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
