import { db } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/client";
import { checkWalletAccess } from "@/lib/wallet";
import { paginate, TPaginationQuery } from "@/models/response";

// ============================================================
// Filter & query types
// ============================================================

export type TDateRangeFilter = {
  from?: Date;
  to?: Date;
  month?: number; // 1–12
  year?: number;
};

export type TItemTypeFilter = {
  type?: "INCOME" | "EXPENSE";
};

export type TWalletSortQuery = {
  sort?: "asc" | "desc";
  sortBy?: "balance" | "name" | "activity";
  include_archived?: boolean;
};

export type TCrossWalletQuery = TDateRangeFilter & {
  include_archived?: boolean;
};

export type TPerWalletQuery = TDateRangeFilter &
  TItemTypeFilter & {
    granularity?: "week" | "month";
  };

// ============================================================
// Internal helpers
// ============================================================

/**
 * Resolves TDateRangeFilter into a Prisma DateTime filter.
 * Priority: month+year > year-only > from/to range.
 */
const resolveDateFilter = (filter: TDateRangeFilter) => {
  const { from, to, month, year } = filter;

  if (month !== undefined && year !== undefined) {
    return {
      gte: new Date(year, month - 1, 1),
      lte: new Date(year, month, 0, 23, 59, 59, 999),
    };
  }

  if (year !== undefined) {
    return {
      gte: new Date(year, 0, 1),
      lte: new Date(year, 11, 31, 23, 59, 59, 999),
    };
  }

  if (from || to) {
    return {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };
  }

  return undefined;
};

const toNum = (d: Decimal | number | null | undefined): number => {
  if (d == null) return 0;
  if (typeof d === "number") return d;
  return d.toNumber();
};

// ============================================================
// Per-wallet statistics
// ============================================================

/**
 * Returns total income, total expense, and net change for a wallet.
 * Optionally scoped by date range, month, or year.
 *
 * NOTE: Does not factor in the wallet's initial balance set at creation
 * (no WalletItem is created for it). This is a schema-level gap.
 */
export const getWalletNetChange = async (
  wallet_id: string,
  user_id: string,
  filter: TDateRangeFilter & TItemTypeFilter = {},
) => {
  await checkWalletAccess(wallet_id, user_id);

  const { type, ...dateFilterInput } = filter;
  const dateFilter = resolveDateFilter(dateFilterInput);

  const grouped = await db.walletItem.groupBy({
    by: ["type"],
    where: {
      wallet_id,
      ...(type ? { type } : {}),
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    _sum: { amount: true },
  });

  const income = new Decimal(
    grouped.find((g) => g.type === "INCOME")?._sum.amount ?? 0,
  );
  const expense = new Decimal(
    grouped.find((g) => g.type === "EXPENSE")?._sum.amount ?? 0,
  );

  return {
    income: income.toNumber(),
    expense: expense.toNumber(),
    net: income.minus(expense).toNumber(),
  };
};

/**
 * Returns average transaction amount for a wallet.
 * Filterable by type, date range, month, or year.
 */
export const getWalletAverageTransaction = async (
  wallet_id: string,
  user_id: string,
  filter: TDateRangeFilter & TItemTypeFilter = {},
) => {
  await checkWalletAccess(wallet_id, user_id);

  const { type, ...dateFilterInput } = filter;
  const dateFilter = resolveDateFilter(dateFilterInput);

  const result = await db.walletItem.aggregate({
    where: {
      wallet_id,
      ...(type ? { type } : {}),
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    _avg: { amount: true },
    _count: { id: true },
    _max: { amount: true },
    _min: { amount: true },
  });

  return {
    average: toNum(result._avg.amount),
    count: result._count.id,
    max: toNum(result._max.amount),
    min: toNum(result._min.amount),
  };
};

/**
 * Returns a chronological running balance derived from wallet items.
 * Items with null date are excluded.
 *
 * NOTE: Starting point is 0, not the wallet's persisted initial balance.
 * Accurate only when all mutations go through createWalletItem / updateWalletItem.
 */
export const getWalletBalanceOverTime = async (
  wallet_id: string,
  user_id: string,
  filter: TDateRangeFilter = {},
) => {
  await checkWalletAccess(wallet_id, user_id);

  const dateFilter = resolveDateFilter(filter);

  const items = await db.walletItem.findMany({
    where: {
      wallet_id,
      date: { not: null },
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    select: { type: true, amount: true, date: true },
    orderBy: { date: "asc" },
  });

  let running = new Decimal(0);

  return items.map((item) => {
    const delta =
      item.type === "INCOME"
        ? new Decimal(item.amount)
        : new Decimal(item.amount).negated();
    running = running.plus(delta);
    return { date: item.date, balance: running.toNumber() };
  });
};

/**
 * Groups wallet income and expense by week or month.
 * Items with null date are excluded.
 */
export const getWalletSpendingByPeriod = async (
  wallet_id: string,
  user_id: string,
  granularity: "week" | "month" = "month",
  filter: TDateRangeFilter & TItemTypeFilter = {},
) => {
  await checkWalletAccess(wallet_id, user_id);

  const { type, ...dateFilterInput } = filter;
  const dateFilter = resolveDateFilter(dateFilterInput);

  const items = await db.walletItem.findMany({
    where: {
      wallet_id,
      date: { not: null },
      ...(type ? { type } : {}),
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    select: { type: true, amount: true, date: true },
    orderBy: { date: "asc" },
  });

  const periodMap = new Map<string, { income: Decimal; expense: Decimal }>();

  for (const item of items) {
    if (!item.date) continue;

    const d = new Date(item.date);
    let key: string;

    if (granularity === "month") {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    } else {
      // ISO week approximation
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(
        ((d.getTime() - jan1.getTime()) / 86_400_000 + jan1.getDay() + 1) / 7,
      );
      key = `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
    }

    if (!periodMap.has(key)) {
      periodMap.set(key, { income: new Decimal(0), expense: new Decimal(0) });
    }

    const entry = periodMap.get(key)!;
    if (item.type === "INCOME") {
      entry.income = entry.income.plus(item.amount);
    } else {
      entry.expense = entry.expense.plus(item.amount);
    }
  }

  return Array.from(periodMap.entries()).map(([period, data]) => ({
    period,
    income: data.income.toNumber(),
    expense: data.expense.toNumber(),
    net: data.income.minus(data.expense).toNumber(),
  }));
};

// ============================================================
// Cross-wallet statistics
// ============================================================

/**
 * Returns the sum of balances across all (non-archived by default) wallets
 * plus per-wallet breakdown. Uses the persisted balance field.
 */
export const getAggregateBalance = async (
  user_id: string,
  include_archived = false,
) => {
  const wallets = await db.wallet.findMany({
    where: {
      user_id,
      ...(include_archived ? {} : { is_archived: false }),
    },
    select: {
      id: true,
      name: true,
      color: true,
      balance: true,
      is_archived: true,
    },
  });

  const total = wallets.reduce(
    (acc, w) => acc.plus(w.balance ?? 0),
    new Decimal(0),
  );

  return {
    total: total.toNumber(),
    count_wallets: wallets.length,
  };
};

/**
 * Returns per-wallet income, expense, and net for cross-wallet comparison.
 * Uses a single groupBy query — no N+1.
 */
export const getCrossWalletIncomeVsExpense = async (
  user_id: string,
  { include_archived = false, ...dateFilterInput }: TCrossWalletQuery = {},
) => {
  const dateFilter = resolveDateFilter(dateFilterInput);

  const wallets = await db.wallet.findMany({
    where: {
      user_id,
      ...(include_archived ? {} : { is_archived: false }),
    },
    select: { id: true },
  });

  const wallet_ids = wallets.map((w) => w.id);

  const grouped = await db.walletItem.groupBy({
    by: ["wallet_id", "type"],
    where: {
      wallet_id: { in: wallet_ids },
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    _sum: { amount: true },
  });

  let total_income = new Decimal(0);
  let total_expense = new Decimal(0);

  for (const row of grouped) {
    const sum = new Decimal(row._sum.amount ?? 0);

    if (row.type === "INCOME") {
      total_income = total_income.plus(sum);
    } else {
      total_expense = total_expense.plus(sum);
    }
  }

  return {
    total_income: total_income.toNumber(),
    total_expense: total_expense.toNumber(),
    total_net: total_income.minus(total_expense).toNumber(),
  };
};

// ============================================================
// Wallet listing with sort + archive toggle (for drill-down UI)
// ============================================================

/**
 * Returns wallets with their activity count for the dashboard wallet list.
 * Supports sort by balance, name, or activity count.
 */
export const getWalletsSorted = async (
  user_id: string,
  params: TWalletSortQuery & TPaginationQuery,
) => {
  const {
    page = 1,
    limit = 10,
    sort = "desc",
    sortBy = "balance",
    include_archived = false,
  } = params;
  const skip = (page - 1) * limit;
  const where = {
    user_id,
    ...(include_archived ? {} : { is_archived: false }),
  };

  const isActivitySort = sortBy === "activity";

  const [wallets, total] = await Promise.all([
    db.wallet.findMany({
      where,
      select: {
        id: true,
        name: true,
        color: true,
        balance: true,
        is_archived: true,
        created_at: true,
        _count: { select: { wallet_items: true } },
      },
      ...(isActivitySort
        ? {} // no DB sort if activity
        : { orderBy: { [sortBy]: sort } }),
      ...(isActivitySort ? {} : { skip, take: limit }),
    }),
    db.wallet.count({ where }),
  ]);

  const mapped = wallets.map((w) => ({
    id: w.id,
    name: w.name,
    color: w.color,
    is_archived: w.is_archived,
    balance: toNum(w.balance),
    activity: w._count.wallet_items,
    created_at: w.created_at,
  }));

  let finalItems = mapped;

  // Handle activity sort (in-memory + paginate after)
  if (isActivitySort) {
    finalItems = mapped.sort((a, b) =>
      sort === "desc" ? b.activity - a.activity : a.activity - b.activity,
    );

    finalItems = finalItems.slice(skip, skip + limit);
  }

  const paginated = paginate(finalItems, total, page, limit);

  return {
    items: paginated.items,
    meta: {
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
      total_pages: paginated.total_pages,
    },
  };
};

// ============================================================
// Composite: full per-wallet dashboard payload (single wallet drill-down)
// ============================================================

/**
 * Aggregates all per-wallet stats in parallel for the drill-down view.
 * Reduces round-trips when the client needs the full wallet dashboard.
 */
export const getWalletDashboard = async (
  wallet_id: string,
  user_id: string,
  filter: TPerWalletQuery = {},
) => {
  const { granularity = "month", type, ...dateFilter } = filter;

  const [wallet, netChange, average, balanceOverTime, spendingByPeriod] =
    await Promise.all([
      checkWalletAccess(wallet_id, user_id),
      getWalletNetChange(wallet_id, user_id, { ...dateFilter, type }),
      getWalletAverageTransaction(wallet_id, user_id, { ...dateFilter, type }),
      getWalletBalanceOverTime(wallet_id, user_id, dateFilter),
      getWalletSpendingByPeriod(wallet_id, user_id, granularity, {
        ...dateFilter,
        type,
      }),
    ]);

  return {
    wallet: {
      id: wallet.id,
      name: wallet.name,
      color: wallet.color,
      balance: toNum(wallet.balance),
      is_archived: wallet.is_archived,
    },
    net_change: netChange,
    average_transaction: average,
    balance_over_time: balanceOverTime,
    spending_by_period: spendingByPeriod,
  };
};

// ============================================================
// Composite: full cross-wallet dashboard payload
// ============================================================

/**
 * Aggregates all cross-wallet stats in parallel for the overview dashboard.
 */
export const getCrossWalletDashboard = async (
  user_id: string,
  query: TCrossWalletQuery = {},
) => {
  const [aggregateBalance, incomeVsExpense] = await Promise.all([
    getAggregateBalance(user_id, query.include_archived),
    getCrossWalletIncomeVsExpense(user_id, query),
  ]);

  return {
    aggregate_balance: aggregateBalance,
    income_vs_expense: incomeVsExpense,
  };
};
