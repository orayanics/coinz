import { useRoute, useRouter } from 'vue-router'
import { computed, watch } from 'vue'
import { useDebouncedRef } from '@/utils/useDebouncedRef'

export function usePaginatedQuery({ limit = 10 }: { limit?: number }) {
  const route = useRoute()
  const router = useRouter()

  const page = computed({
    get: () => Number(route.query.page) || 1,
    set: (val) => router.replace({ query: { ...route.query, page: val } }),
  })

  const sort = computed({
    get: () => (route.query.sort as 'asc' | 'desc') || 'desc',
    set: (val) => router.replace({ query: { ...route.query, sort: val } }),
  })

  const sortBy = computed({
    get: () => (route.query.sortBy as 'created_at' | 'updated_at') || 'created_at',
    set: (val) => router.replace({ query: { ...route.query, sortBy: val } }),
  })

  const filter = computed({
    get: () => (route.query.filter as 'EXPENSE' | 'INCOME') || undefined,
    set: (val) => router.replace({ query: { ...route.query, filter: val || undefined } }),
  })

  const [searchInput, searchDebounced] = useDebouncedRef((route.query.search as string) || '', 400)

  // Sync debounced search back to URL
  watch(searchDebounced, (val) => {
    router.replace({ query: { ...route.query, search: val || undefined, page: 1 } })
  })

  // Reset page on filter change
  watch([sort, sortBy, filter], () => {
    router.replace({ query: { ...route.query, page: undefined } })
  })

  const params = computed(() => ({
    page: page.value,
    limit,
    search: searchDebounced.value || undefined,
    sort: sort.value,
    sortBy: sortBy.value,
    filter: filter.value,
  }))

  return { page, sort, sortBy, searchInput, params, filter }
}
