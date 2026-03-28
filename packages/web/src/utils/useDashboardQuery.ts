import { useRoute, useRouter } from 'vue-router'
import { computed, watch } from 'vue'
import type {
  TCrossWalletDashboardQuery,
  TWalletDashboardQuery,
  TWalletListQuery,
} from '@/api/useDashboard'

// ── Shared date range segment ─────────────────────────────────────────────────
// Used by both overview and per-wallet drill-down.

export function useDateRangeQuery() {
  const route = useRoute()
  const router = useRouter()

  const from = computed({
    get: () => (route.query.from as string) || undefined,
    set: (val) => router.replace({ query: { ...route.query, from: val || undefined } }),
  })

  const to = computed({
    get: () => (route.query.to as string) || undefined,
    set: (val) => router.replace({ query: { ...route.query, to: val || undefined } }),
  })

  const month = computed({
    get: () => (route.query.month ? Number(route.query.month) : undefined),
    set: (val) => router.replace({ query: { ...route.query, month: val ?? undefined } }),
  })

  const year = computed({
    get: () => (route.query.year ? Number(route.query.year) : undefined),
    set: (val) => router.replace({ query: { ...route.query, year: val ?? undefined } }),
  })

  const dateParams = computed(() => ({
    from: from.value,
    to: to.value,
    month: month.value,
    year: year.value,
  }))

  return { from, to, month, year, dateParams }
}

// ── Cross-wallet overview query ───────────────────────────────────────────────
// Drives GET /dashboard

export function useCrossWalletQuery() {
  const route = useRoute()
  const router = useRouter()

  const { from, to, month, year, dateParams } = useDateRangeQuery()

  const includeArchived = computed({
    get: () => route.query.include_archived === 'true',
    set: (val) =>
      router.replace({
        query: { ...route.query, include_archived: val ? 'true' : undefined },
      }),
  })

  // Reset to first implicit page when filters change
  watch([from, to, month, year, includeArchived], () => {
    router.replace({ query: { ...route.query, page: undefined } })
  })

  const params = computed<TCrossWalletDashboardQuery>(() => ({
    ...dateParams.value,
    include_archived: includeArchived.value || undefined,
  }))

  return { from, to, month, year, includeArchived, params }
}

// ── Wallet list query ─────────────────────────────────────────────────────────
// Drives GET /dashboard/wallets

export function useDashboardWalletListQuery() {
  const route = useRoute()
  const router = useRouter()

  const includeArchived = computed({
    get: () => route.query.include_archived === 'true',
    set: (val) =>
      router.replace({
        query: { ...route.query, include_archived: val ? 'true' : undefined },
      }),
  })

  const sort = computed({
    get: () => (route.query.sort as 'asc' | 'desc') || 'desc',
    set: (val) => router.replace({ query: { ...route.query, sort: val } }),
  })

  const sortBy = computed({
    get: () => (route.query.sortBy as 'balance' | 'name' | 'activity') || 'balance',
    set: (val) => router.replace({ query: { ...route.query, sortBy: val } }),
  })

  const page = computed({
    get: () => Number(route.query.page) || 1,
    set: (val) => router.replace({ query: { ...route.query, page: val } }),
  })

  watch([sort, sortBy, includeArchived], () => {
    router.replace({ query: { ...route.query, page: undefined } })
  })

  const params = computed<TWalletListQuery>(() => ({
    page: page.value,
    include_archived: includeArchived.value || undefined,
    sort: sort.value,
    sortBy: sortBy.value,
    limit: 5,
  }))

  return { includeArchived, sort, sortBy, params, page }
}

// ── Per-wallet drill-down query ───────────────────────────────────────────────
// Drives GET /dashboard/wallets/:id

export function useWalletDashboardQuery() {
  const route = useRoute()
  const router = useRouter()

  const { from, to, month, year, dateParams } = useDateRangeQuery()

  const type = computed({
    get: () => (route.query.type as 'INCOME' | 'EXPENSE') || undefined,
    set: (val) => router.replace({ query: { ...route.query, type: val || undefined } }),
  })

  const granularity = computed({
    get: () => (route.query.granularity as 'week' | 'month') || 'month',
    set: (val) => router.replace({ query: { ...route.query, granularity: val } }),
  })

  watch([from, to, month, year, type, granularity], () => {
    router.replace({ query: { ...route.query, page: undefined } })
  })

  const params = computed<TWalletDashboardQuery>(() => ({
    ...dateParams.value,
    type: type.value,
    granularity: granularity.value,
  }))

  return { from, to, month, year, type, granularity, params }
}
