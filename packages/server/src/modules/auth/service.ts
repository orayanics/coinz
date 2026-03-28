import { db } from "@/lib/prisma";
import type {
  TUserLogin,
  TUserRegister,
  TUserUpdate,
} from "@/modules/auth/model";

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

export const updateProfile = async (user_id: string, data: TUserUpdate) => {
  const user = await db.user.findUnique({ where: { id: user_id } });
  if (!user) throw new Error("User not found");

  const updateData: TUserUpdate = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.new_password !== undefined) {
    if (!data.old_password) {
      throw new Error("old_password is required when changing password");
    }

    const isOldPasswordCorrect = await Bun.password.verify(
      data.old_password,
      user.password,
    );
    if (!isOldPasswordCorrect) {
      throw new Error("Old password is incorrect");
    }

    const isSame = await Bun.password.verify(data.new_password, user.password);
    if (isSame) {
      throw new Error(
        "New password cannot be the same as the current password",
      );
    }

    updateData.new_password = await Bun.password.hash(data.new_password);
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("No valid fields provided to update");
  }

  return db.user.update({
    where: { id: user_id },
    data: updateData,
    select: { id: true, name: true },
  });
};

export const getUser = async (user_id: string) => {
  const user = await db.user.findUnique({ where: { id: user_id } });
  if (!user) throw new Error("User not found");
  return user;
};
