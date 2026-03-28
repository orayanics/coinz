import { t } from "elysia";

export const UserPlain = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
  created_at: t.Date(),
  updated_at: t.Date(),
});

export const UserRegister = t.Object({
  ...t.Pick(UserPlain, ["name", "email"]).properties,
  password: t.String({
    minLength: 8,
    pattern: "^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$",
    error:
      "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character.",
  }),
});
export const UserLogin = t.Object({
  ...t.Pick(UserPlain, ["email", "password"]).properties,
});
export const UserUpdate = t.Object(
  {
    name: t.Optional(t.String()),
    old_password: t.Optional(t.String()),
    new_password: t.Optional(
      t.String({
        minLength: 8,
        pattern: "^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).+$",
        error:
          "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character.",
      }),
    ),
  },
  {
    error: "old_password is required when changing password.",
    check: (v: { new_password?: string; old_password?: string }) => {
      if (v.new_password !== undefined && v.old_password === undefined)
        return false;
      return true;
    },
  },
);
export type TUserUpdate = typeof UserUpdate.static;

export type TUserRegister = typeof UserRegister.static;
export type TUserLogin = typeof UserLogin.static;
