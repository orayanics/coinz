import { t } from "elysia";

export const WalletPlain = t.Object({
  id: t.String(),
  user_id: t.String(),
  balance: t.Number(),
  name: t.String(),
  color: t.String(),
  is_archived: t.Boolean(),
  created_at: t.Date(),
  updated_at: t.Date(),
});

export const WalletCreate = t.Object({
  balance: t.Optional(t.Number({ default: 0 })),
  name: t.Required(t.String({ minLength: 1 })),
  color: t.Optional(t.String({ default: "#94ff76" })),
  is_archived: t.Boolean({ default: false }),
});

export const WalletUpdate = t.Object({
  balance: t.Optional(t.Number({ default: 0, minimum: 0 })),
  name: t.Optional(t.String({ minLength: 1 })),
  color: t.Optional(t.String()),
  is_archived: t.Optional(t.Boolean()),
});

export type TWalletCreate = typeof WalletCreate.static;
export type TWalletUpdate = typeof WalletUpdate.static;
