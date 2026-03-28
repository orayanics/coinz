import { t } from "elysia";

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

export const WalletDashboardQuery = t.Composite([
  DateRangeQuery,
  ItemTypeQuery,
  GranularityQuery,
]);

export const CrossWalletDashboardQuery = t.Composite([
  DateRangeQuery,
  ArchiveToggleQuery,
]);

export const WalletListQuery = t.Composite([
  ArchiveToggleQuery,
  WalletSortQuery,
]);

export type TWalletDashboardQuery = typeof WalletDashboardQuery.static;
export type TCrossWalletDashboardQuery =
  typeof CrossWalletDashboardQuery.static;
export type TWalletListQuery = typeof WalletListQuery.static;

export type TDateRangeFilter = typeof DateRangeQuery.static;
export type TItemTypeFilter = typeof ItemTypeQuery.static;
export type TGranularityFilter = typeof GranularityQuery.static;
export type TArchiveToggleFilter = typeof ArchiveToggleQuery.static;
export type TWalletSortQuery = typeof WalletSortQuery.static;
