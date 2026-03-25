import { db } from "@/lib/prisma";
import type { TUserLogin, TUserRegister } from "@/modules/auth/model";

export const register = async (data: TUserRegister) => {
  const existing = await db.user.findUnique({
    where: { email: data.email },
  });
  if (existing) throw new Error("Choose a valid email");

  const hashed = await Bun.password.hash(data.password);

  return await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
    },
  });
};

export const login = async (data: TUserLogin) => {
  const user = await db.user.findUnique({ where: { email: data.email } });

  if (!user) {
    await Bun.password.hash(data.password);
    throw new Error("Invalid credentials");
  }

  const valid = await Bun.password.verify(data.password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  return user;
};

export const refresh = async (user_id: string) => {
  const user = await db.user.findUnique({ where: { id: user_id } });
  if (!user) throw new Error("User not found");
  return user.id;
};
