import { tryOk } from "@/lib/responseApi";
import { jwtPlugin } from "@/plugins/jwt";
import Elysia, { t } from "elysia";
import {
  createWalletItem,
  deleteWalletItem,
  getWalletItems,
  updateWalletItem,
} from "./service";
import {
  ApiError,
  ApiSuccess,
  ok,
  PaginationQuery,
  ParamsQuery,
} from "@/models/response";
import { WalletItemCreate, WalletItemUpdate } from "./model";

export const walletItemsModule = new Elysia({
  prefix: "/wallet",
  tags: ["Wallet Item"],
})
  .use(jwtPlugin)
  .post(
    "/:wallet_id/items",
    async ({ body, params, userId, status }) => {
      const result = await tryOk(() =>
        createWalletItem(body, params.wallet_id, userId),
      );

      if (!result.success) return status(400, result);
      return status(201, ok(result.data));
    },
    {
      auth: true,
      body: WalletItemCreate,
      params: t.Object({
        wallet_id: t.String(),
      }),
      response: {
        201: ApiSuccess(),
        400: ApiError,
      },
      detail: {
        summary: "Create wallet item",
        description: "Create a wallet item",
      },
    },
  )
  .patch(
    "/:wallet_id/items/:item_id",
    async ({ body, params, userId, status }) => {
      const result = await tryOk(() =>
        updateWalletItem(body, params.item_id, params.wallet_id, userId),
      );

      if (!result.success) return status(400, result);
      return status(200, ok(undefined));
    },
    {
      auth: true,
      body: WalletItemUpdate,
      params: t.Object({
        wallet_id: t.String(),
        item_id: t.String(),
      }),
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
    },
  )
  .delete(
    "/:wallet_id/items/:item_id",
    async ({ params, userId, status }) => {
      const result = await tryOk(() =>
        deleteWalletItem(params.item_id, params.wallet_id, userId),
      );

      if (!result.success) return status(400, result);
      return status(200, ok(undefined));
    },
    {
      auth: true,
      params: t.Object({
        wallet_id: t.String(),
        item_id: t.String(),
      }),
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
    },
  )
  .get(
    "/:wallet_id/items",
    async ({ userId, params, query, status }) => {
      const result = await tryOk(() =>
        getWalletItems(userId, params.wallet_id, query),
      );
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      auth: true,
      params: t.Object({
        wallet_id: t.String(),
      }),
      query: t.Composite([PaginationQuery, ParamsQuery]),
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
      detail: {
        summary: "Get Wallet Items",
        description: "Get all items by wallet id",
      },
    },
  );
