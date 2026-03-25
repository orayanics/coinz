<template>
  <div>
    <!-- States -->
    <StateLoading v-if="isLoading" />
    <StateError v-else-if="isError" />
    <StateNull v-else-if="!data" />

    <!-- Two Column -->
    <div v-else class="grid md:grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
      <!-- Wallet Modals -->
      <DeleteWallet :wallet-id="walletId" />
      <UpdateWallet :wallet="data" :wallet-id="walletId" />
      <CreateWalletItem :wallet-id="walletId" />

      <!-- Wallet -->
      <div class="col-span-1">
        <WalletCard :wallet="data" />
        <div class="flex gap-2 mt-4">
          <button class="btn btn-neutral" @click="openCreateItem">Add Item</button>
          <button class="btn btn-neutral" @click="openUpdateWallet">Edit Wallet</button>
          <button class="btn btn-error" @click="openDeleteWallet">Delete Wallet</button>
        </div>
      </div>

      <div class="flex flex-col gap-4 col-span-1">
        <!-- Search, filter, sort -->
        <div class="grid md:grid-cols-1 lg:grid-cols-6 gap-2 items-center">
          <label class="input w-full col-span-6 lg:col-span-4 flex items-center gap-2">
            <PhMagnifyingGlass />
            <input v-model="searchInput" type="text" placeholder="Search wallets..." />
          </label>

          <select v-model="sortBy" class="select w-full col-span-6 lg:col-span-1">
            <option value="created_at">Created</option>
            <option value="updated_at">Updated</option>
          </select>

          <select v-model="sort" class="select w-full col-span-6 lg:col-span-1">
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>

        <!-- Wallet Item States -->
        <StateLoading v-if="isItemsLoading" />
        <StateError v-else-if="isItemsError" />
        <StateNull v-else-if="!wallet_items?.items.length" />

        <!-- Wallet Items -->
        <div
          v-else
          className="overflow-x-auto rounded-lg border border-base-content/20 bg-base-100"
        >
          <table className="table">
            <thead>
              <tr>
                <th>Note</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody v-for="item in wallet_items?.items" :key="item.id">
              <tr>
                <td>{{ item.note }}</td>
                <td
                  class="flex gap-2 items-center"
                  :class="item.type === 'EXPENSE' ? 'text-error' : 'text-success'"
                >
                  <component :is="item.type === 'EXPENSE' ? PhMinus : PhPlus" />
                  {{ item.amount }}
                </td>
                <td class="text-base-content/60">
                  {{ item.date ? formatDate(item.date) : 'N/A' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <PaginationActions
          v-if="wallet_items"
          v-model:page="page"
          :total-pages="wallet_items.meta.total_pages"
          :total="wallet_items.meta.total"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { walletQueryOptions } from '@/api/useWallets'
import { walletItemsQueryOptions } from '@/api/useWalletItem'
import { usePaginatedQuery } from '@/utils/usePaginationQuery'
import WalletCard from '@/components/Wallet/WalletCard.vue'
import PaginationActions from '@/components/Pagination/PaginationActions.vue'
import { StateError, StateLoading, StateNull } from '@/components/States'
import { PhMagnifyingGlass, PhPlus, PhMinus } from '@phosphor-icons/vue'
import DeleteWallet from './components/DeleteWallet.vue'
import UpdateWallet from './components/UpdateWallet.vue'
import CreateWalletItem from '../wallet_item/components/CreateWalletItem.vue'
import { useDeleteWallet } from './hooks/useDeleteWallet'
import { useUpdateWallet } from './hooks/useUpdateWallet'
import { useCreateWalletItem } from '../wallet_item/hooks/useCreateWalletItem'
import { formatDate } from '@/utils/useDate'
const { open: openDeleteWallet } = useDeleteWallet()
const { open: openUpdateWallet } = useUpdateWallet()
const { open: openCreateItem } = useCreateWalletItem()

const route = useRoute()
if (!route.params.walletId) {
  throw new Error('walletId param is required')
}
const walletId = computed(() => route.params.walletId as string)

// Wallet
const { data, isLoading, isError } = useQuery(computed(() => walletQueryOptions(walletId.value)))

// Wallet Items
const { page, sort, sortBy, searchInput, params } = usePaginatedQuery({ limit: 10 })
const {
  data: wallet_items,
  isLoading: isItemsLoading,
  isError: isItemsError,
} = useQuery(computed(() => walletItemsQueryOptions(params.value, walletId.value)))

console.log(data.value)
</script>

<style scoped></style>
