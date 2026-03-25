import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "src/generated/prisma/client";

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL)
  throw new Error("DATABASE_URL must be defined in the environment variables.");

const adapter = new PrismaLibSql({
  url: DB_URL,
});

export const db = new PrismaClient({
  adapter,
}).$extends({
  result: {
    // to number for sqlite
    wallet: {
      balance: {
        needs: { balance: true },
        compute(wallet) {
          return wallet.balance?.toNumber();
        },
      },
    },
    // to number for sqlite
    walletItem: {
      amount: {
        needs: { amount: true },
        compute(walletItem) {
          return walletItem.amount.toNumber();
        },
      },
    },
  },
});
