import { db } from "./prisma";

export const checkWalletAccess = async (wallet_id: string, user_id: string) => {
  const wallet = await db.wallet.findUnique({ where: { id: wallet_id } });
  if (!wallet) throw new Error("Wallet not found");
  if (wallet.user_id !== user_id) throw new Error("Forbidden");
  return wallet;
};

// for wallet items
// validate if wallet item exits and if wallet item belongs to wallet
export const checkWalletItem = async (wallet_id: string, item_id: string) => {
  const existing = await db.walletItem.findUnique({ where: { id: item_id } });
  if (!existing) throw new Error("Wallet item not found");
  if (existing.wallet_id !== wallet_id)
    throw new Error("Wallet item does not belong to wallet");
  return existing;
};
