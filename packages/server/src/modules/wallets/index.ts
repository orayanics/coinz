import { jwtPlugin } from "@/plugins/jwt";
import Elysia, { t } from "elysia";
import {
  createWallet,
  deleteWallet,
  getWallet,
  getWallets,
  updateWallet,
} from "./service";
import { tryOk } from "@/lib/responseApi";
import {
  ApiError,
  ApiSuccess,
  ok,
  PaginationQuery,
  ParamsQuery,
} from "@/models/response";
import { WalletCreate, WalletUpdate, WalletPlain } from "./model";

export const walletsModule = new Elysia({
  prefix: "/wallets",
  tags: ["Wallets"],
})
  .use(jwtPlugin)
  .post(
    "/",
    async ({ body, userId, status }) => {
      const result = await tryOk(() => createWallet(body, userId));
      if (!result.success) return status(400, result);
      return status(201, ok(result.data));
    },
    {
      auth: true,
      body: WalletCreate,
      response: {
        201: ApiSuccess(WalletPlain),
        400: ApiError,
      },
      detail: {
        summary: "Create Wallet",
        description: "Creates a new wallet",
      },
    },
  )
  .patch(
    "/:id",
    async ({ params, body, userId, status }) => {
      const result = await tryOk(() => updateWallet(body, params.id, userId));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: WalletUpdate,
      response: {
        200: ApiSuccess(WalletPlain),
        400: ApiError,
      },
      detail: {
        summary: "Update Wallet",
        description: "Update a wallet",
      },
    },
  )
  .delete(
    "/:id",
    async ({ params, userId, status }) => {
      const result = await tryOk(() => deleteWallet(params.id, userId));
      if (!result.success) return status(400, result);
      return status(200, ok(undefined));
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
      detail: {
        summary: "Delete Wallet",
        description: "Delete a wallet",
      },
    },
  )
  .get(
    "/:id",
    async ({ params, userId, status }) => {
      const result = await tryOk(() => getWallet(params.id, userId));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
      detail: {
        summary: "Get Wallet",
        description: "Get a wallet",
      },
    },
  )
  .get(
    "/",
    async ({ userId, query, status }) => {
      const result = await tryOk(() => getWallets(userId, query));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      auth: true,
      query: t.Composite([PaginationQuery, ParamsQuery]),
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
      detail: {
        summary: "Get Wallets",
        description: "Get all user wallets",
      },
    },
  );
