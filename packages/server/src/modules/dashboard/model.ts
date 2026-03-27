import { PaginationQuery } from "@/models/response";
import { t } from "elysia";

// ── Query schemas ────────────────────────────────────────────

export const DateRangeQuery = t.Object({
  from: t.Optional(t.String({ format: "date-time" })),
  to: t.Optional(t.String({ format: "date-time" })),
  month: t.Optional(t.Numeric({ minimum: 1, maximum: 12 })),
  year: t.Optional(t.Numeric({ minimum: 2000 })),
});

export const ItemTypeQuery = t.Object({
  type: t.Optional(t.Union([t.Literal("INCOME"), t.Literal("EXPENSE")])),
});

export const GranularityQuery = t.Object({
  granularity: t.Optional(t.Union([t.Literal("week"), t.Literal("month")])),
});

export const ArchiveToggleQuery = t.Object({
  include_archived: t.Optional(t.BooleanString()),
});

export const WalletSortQuery = t.Object({
  sort: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
  sortBy: t.Optional(
    t.Union([t.Literal("balance"), t.Literal("name"), t.Literal("activity")]),
  ),
});

// Composed query for per-wallet drill-down
export const WalletDashboardQuery = t.Composite([
  DateRangeQuery,
  ItemTypeQuery,
  GranularityQuery,
]);

// Composed query for cross-wallet overview
export const CrossWalletDashboardQuery = t.Composite([
  DateRangeQuery,
  ArchiveToggleQuery,
]);

// Composed query for wallet list
export const WalletListQuery = t.Composite([
  ArchiveToggleQuery,
  WalletSortQuery,
]);

// ── Static types ─────────────────────────────────────────────

export type TWalletDashboardQuery = typeof WalletDashboardQuery.static;
export type TCrossWalletDashboardQuery =
  typeof CrossWalletDashboardQuery.static;
export type TWalletListQuery = typeof WalletListQuery.static;
