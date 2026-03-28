import Elysia, { t, status } from "elysia";
import { tryOk } from "@/lib/responseApi";
import { ApiError, ApiSuccess, ok } from "@/models/response";
import { UserLogin, UserRegister, UserUpdate } from "@/modules/auth/model";

import { register, refresh, login, updateProfile, getUser } from "./service";
import { jwtPlugin } from "@/plugins/jwt";

export const authModule = new Elysia({ prefix: "/auth", tags: ["Auth"] })
  .use(jwtPlugin)
  .post(
    "/register",
    async ({ body }) => {
      const result = await tryOk(() => register(body));

      if (!result.success) return status(400, result);
      return status(201, ok(undefined));
    },
    {
      body: UserRegister,
      response: {
        201: ApiSuccess(),
        400: ApiError,
      },
      detail: {
        summary: "Register",
        description: "Creates a new user",
      },
    },
  )
  .post(
    "/login",
    async ({ body, issueTokens }) => {
      const result = await tryOk(() => login(body));

      if (!result.success) return status(400, result);

      const { accessToken } = await issueTokens(result.data.id);
      return status(200, ok({ accessToken }));
    },
    {
      body: UserLogin,
      response: {
        200: ApiSuccess(
          t.Object({
            accessToken: t.String(),
          }),
        ),
        400: ApiError,
      },
      detail: {
        summary: "Login",
        description: "Returns user with access and refresh tokens",
      },
    },
  )

  .post(
    "/refresh",
    async ({ cookie: { refreshToken }, refreshJwt, issueTokens, status }) => {
      const result = await tryOk(async () => {
        if (!refreshToken.value) throw new Error("Missing refresh token");

        const payload = await refreshJwt.verify(refreshToken.value);

        if (!payload) throw new Error("Invalid or expired refresh token");
        if (payload.type !== "refresh") throw new Error("Invalid token type");

        const userId = await refresh(payload.sub);
        return await issueTokens(userId);
      });

      if (!result.success) return status(401, result);
      return status(200, result);
    },
    {
      cookie: t.Object({
        refreshToken: t.Optional(t.String()),
      }),
      response: {
        200: ApiSuccess(t.Object({ accessToken: t.String() })),
        401: ApiError,
      },
      detail: {
        summary: "Refresh Tokens",
        description:
          "Issues a new access and refresh token pair from a valid refresh token",
      },
    },
  )

  .post(
    "/logout",
    ({ cookie: { refreshToken }, status }) => {
      refreshToken.set({
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/auth",
      });
      return status(200, ok(undefined));
    },
    {
      response: {
        200: ApiSuccess(),
      },
      detail: {
        summary: "Logout",
        description: "Logs out the user by clearing the refresh token cookie.",
      },
    },
  )

  .patch(
    "/profile",
    async ({ body, userId, status }) => {
      const result = await tryOk(async () => {
        if (!userId) throw new Error("Unauthorized");
        return await updateProfile(userId, body);
      });

      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      auth: true,
      body: UserUpdate,
      response: {
        200: ApiSuccess(t.Object({ name: t.String() })),
        400: ApiError,
      },
      detail: {
        summary: "Update Profile",
        description:
          "Updates user's profile information including name and password",
      },
    },
  )

  .get(
    "me",
    async ({ userId, status }) => {
      const result = await tryOk(async () => {
        if (!userId) throw new Error("Unauthorized");
        return await getUser(userId);
      });

      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      auth: true,
      response: {
        200: ApiSuccess(
          t.Object({ id: t.String(), name: t.String(), email: t.String() }),
        ),
        400: ApiError,
      },
      detail: {
        summary: "Get Current User",
        description: "Returns the current authenticated user's information",
      },
    },
  );
