<template>
  <div class="flex flex-col gap-4 h-full">
    <!-- Search, filter, sort -->
    <div class="grid md:grid-cols-1 lg:grid-cols-7 gap-2 items-center">
      <button class="btn btn-success w-full col-span-7 lg:col-span-1" @click="openCreateWallet">
        Add Wallet
      </button>

      <label class="input w-full col-span-7 lg:col-span-4 flex items-center gap-2">
        <PhMagnifyingGlass />
        <input v-model="searchInput" type="text" placeholder="Search wallets..." />
      </label>

      <select v-model="sortBy" class="select w-full col-span-7 lg:col-span-1">
        <option value="created_at">Created</option>
        <option value="updated_at">Updated</option>
      </select>

      <select v-model="sort" class="select w-full col-span-7 lg:col-span-1">
        <option value="desc">Newest</option>
        <option value="asc">Oldest</option>
      </select>
    </div>

    <!-- States -->
    <StateLoading v-if="isLoading" />
    <StateError v-else-if="isError" />
    <StateNull v-else-if="!data?.items?.length" />

    <!-- List -->
    <div v-else class="grid grid-rows-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
      <RouterLink
        v-for="item in data.items"
        :key="item.id"
        :to="`/app/wallets/${item.id}`"
        class="flex"
        :class="data.items.length > 0 ? 'items-start' : 'items-center'"
      >
        <WalletCard :wallet="item" />
      </RouterLink>
    </div>

    <!-- Modals -->
    <CreateWallet />

    <!-- Pagination -->
    <PaginationActions
      v-if="data"
      v-model:page="page"
      :total-pages="data.meta.total_pages"
      :total="data.meta.total"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { walletsQueryOptions } from '@/api/useWallets'
import { PhMagnifyingGlass } from '@phosphor-icons/vue'
import { usePaginatedQuery } from '@/utils/usePaginationQuery'
import PaginationActions from '@/components/Pagination/PaginationActions.vue'
import WalletCard from '@/components/Wallet/WalletCard.vue'
import { StateError, StateLoading, StateNull } from '@/components/States'
import CreateWallet from './components/CreateWallet.vue'
import { RouterLink } from 'vue-router'
import { useCreateWallet } from './hooks/useCreateWallet'
const { open: openCreateWallet } = useCreateWallet()

const { page, sort, sortBy, searchInput, params } = usePaginatedQuery({ limit: 6 })

const { isLoading, isError, data } = useQuery(computed(() => walletsQueryOptions(params.value)))
</script>
