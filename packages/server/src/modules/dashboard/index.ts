import { Elysia, t } from "elysia";
import { jwtPlugin } from "@/plugins/jwt";
import { tryOk } from "@/lib/responseApi";
import { ok, ApiSuccess, ApiError, PaginationQuery } from "@/models/response";
import {
  getCrossWalletDashboard,
  getWalletDashboard,
  getWalletsSorted,
} from "./service";
import {
  CrossWalletDashboardQuery,
  WalletDashboardQuery,
  WalletListQuery,
} from "./model";

export const dashboardModule = new Elysia({
  prefix: "/dashboard",
  tags: ["Dashboard"],
})
  .use(jwtPlugin)

  /**
   * GET /dashboard
   * Cross-wallet overview: aggregate balance, activity ranking,
   * income vs expense comparison, net worth trend.
   * Filterable by date range / month / year. Archive toggle included.
   */
  .get(
    "/",
    async ({ userId, query, status }) => {
      const result = await tryOk(() =>
        getCrossWalletDashboard(userId, {
          from: query.from ? new Date(query.from) : undefined,
          to: query.to ? new Date(query.to) : undefined,
          month: query.month,
          year: query.year,
          include_archived: query.include_archived,
        }),
      );
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      auth: true,
      query: CrossWalletDashboardQuery,
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
      detail: {
        summary: "Cross-wallet Dashboard",
        description:
          "Aggregate balance, activity ranking, income vs expense, and net worth trend across all wallets.",
      },
    },
  )

  /**
   * GET /dashboard/wallets
   * Wallet list with sort by balance | name | activity and archive toggle.
   * Intended as the sortable wallet picker / overview list for drill-down.
   */
  .get(
    "/wallets",
    async ({ userId, query, status }) => {
      const result = await tryOk(() => getWalletsSorted(userId, query));
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      auth: true,
      query: t.Composite([PaginationQuery, WalletListQuery]),
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
      detail: {
        summary: "Wallet List (sorted)",
        description:
          "Returns all wallets with activity counts. Sortable by balance, name, or activity. Supports archive toggle.",
      },
    },
  )

  /**
   * GET /dashboard/wallets/:id
   * Per-wallet drill-down: net change, average transaction, balance over time,
   * and spending/income grouped by week or month.
   * Filterable by date range / month / year / item type / granularity.
   */
  .get(
    "/wallets/:id",
    async ({ params, userId, query, status }) => {
      const result = await tryOk(() =>
        getWalletDashboard(params.id, userId, {
          from: query.from ? new Date(query.from) : undefined,
          to: query.to ? new Date(query.to) : undefined,
          month: query.month,
          year: query.year,
          type: query.type,
          granularity: query.granularity,
        }),
      );
      if (!result.success) return status(400, result);
      return status(200, ok(result.data));
    },
    {
      auth: true,
      params: t.Object({
        id: t.String(),
      }),
      query: WalletDashboardQuery,
      response: {
        200: ApiSuccess(),
        400: ApiError,
      },
      detail: {
        summary: "Per-wallet Dashboard",
        description:
          "Net change, average transaction, balance over time, and spending by period for a single wallet.",
      },
    },
  );
