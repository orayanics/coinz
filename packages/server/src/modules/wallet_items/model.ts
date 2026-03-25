import { t } from "elysia";

export enum ITEM_TYPE {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export const WalletItemPlain = t.Object({
  id: t.String(),
  wallet_id: t.String(),
  type: t.Enum(ITEM_TYPE),
  amount: t.Number(),
  note: t.String(),
  date: t.String(),
  created_at: t.Date(),
  updated_at: t.Date(),
});

export const WalletItemCreate = t.Object({
  type: t.Enum(ITEM_TYPE),
  amount: t.Required(t.Number({ minimum: 1 })),
  note: t.Optional(t.String()),
  date: t.Optional(t.Date()),
});

export const WalletItemUpdate = t.Object({
  type: t.Optional(t.Enum(ITEM_TYPE)),
  amount: t.Optional(t.Number({ minimum: 1 })),
  note: t.Optional(t.String()),
  date: t.Optional(t.Date()),
});

export type TWalletItemCreate = typeof WalletItemCreate.static;
export type TWalletItemUpdate = typeof WalletItemUpdate.static;
