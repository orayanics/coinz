import { t } from "elysia";
import type { TSchema } from "elysia";

export const ParamsQuery = t.Object({
  id: t.Optional(t.String()),
  search: t.Optional(t.String()),
  sort: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
  sortBy: t.Optional(
    t.Union([
      t.Literal("created_at"),
      t.Literal("updated_at"),
      t.Literal("date"),
    ]),
  ),
});

export const PaginationQuery = t.Object({
  page: t.Optional(t.Numeric({ default: 1, minimum: 1 })),
  limit: t.Optional(t.Numeric({ default: 10, minimum: 1, maximum: 100 })),
});

const WALLET_ITEM_FILTER = ["EXPENSE", "INCOME"] as const;

export const WalletItemFilterQuery = t.Object({
  filter: t.Optional(
    t.Union(WALLET_ITEM_FILTER.map((v) => t.Literal(v)) as any),
  ),
});

export type TParamsQuery = typeof ParamsQuery.static;
export type TPaginationQuery = typeof PaginationQuery.static;
export type TWalletItemFilterQuery = typeof WalletItemFilterQuery.static;

export const Paginated = <T extends TSchema>(schema: T) =>
  t.Object({
    items: t.Array(schema),
    total: t.Number(),
    page: t.Number(),
    limit: t.Number(),
    total_pages: t.Number(),
  });

export const ApiResponse = <T extends TSchema>(schema: T) =>
  t.Object({
    success: t.Boolean(),
    data: t.Optional(schema),
    error: t.Optional(t.String()),
  });

export const ApiSuccess = <T extends TSchema>(schema?: T) =>
  t.Object({
    success: t.Literal(true),
    data: schema ? t.Optional(schema) : t.Optional(t.Unknown()),
  });

export const ApiError = t.Object({
  success: t.Literal(false),
  error: t.String(),
  fields: t.Optional(t.Record(t.String(), t.String())),
});

export const ok = <T>(data: T) => ({ success: true as const, data });
export const error = (message: string) => ({
  success: false as const,
  error: message,
});

export const paginate = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
) => ({
  items,
  total,
  page,
  limit,
  total_pages: Math.ceil(total / limit),
});
