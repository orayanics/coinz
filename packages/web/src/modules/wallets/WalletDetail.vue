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
        <div class="flex justify-center gap-2 mt-4">
          <button class="btn" @click="openCreateItem">Add Item</button>
          <button class="btn" @click="openUpdateWallet">Edit Wallet</button>
          <button class="btn btn-error" @click="openDeleteWallet">Delete Wallet</button>
        </div>
      </div>

      <div class="flex flex-col gap-4 col-span-1">
        <!-- Search, filter, sort -->
        <div class="grid md:grid-cols-1 lg:grid-cols-12 gap-2 items-center">
          <label class="input w-full col-span-6 lg:col-span-12 flex items-center gap-2">
            <PhMagnifyingGlass />
            <input v-model="searchInput" type="text" placeholder="Search wallets..." />
          </label>

          <div class="flex gap-2 col-span-6 lg:col-span-4">
            <button
              type="button"
              class="btn flex-1"
              :class="filter === 'EXPENSE' ? 'btn-error' : 'btn-soft'"
              @click="filter = filter === 'EXPENSE' ? undefined : 'EXPENSE'"
            >
              Expense
            </button>
            <button
              type="button"
              class="btn flex-1"
              :class="filter === 'INCOME' ? 'btn-success' : 'btn-soft'"
              @click="filter = filter === 'INCOME' ? undefined : 'INCOME'"
            >
              Income
            </button>
          </div>

          <select v-model="sort" class="select w-full col-span-12 lg:col-span-8">
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
                <th>Actions</th>
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
                <td class="flex gap-2">
                  <button class="btn btn-square" @click="openUpdateModal(item)">
                    <component :is="PhPencil" />
                  </button>
                  <button class="btn btn-square" @click="openDeleteModal(item)">
                    <component :is="PhTrash" />
                  </button>
                </td>
              </tr>
            </tbody>

            <!-- Wallet item modals -->
            <DeleteWalletItem :wallet-id="deleteItem?.wallet_id" :item-id="deleteItem?.id" />
            <UpdateWalletItem
              :item="updateItemModalValue"
              :wallet-id="updateItem?.wallet_id"
              :item-id="updateItem?.id"
            />
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
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { walletQueryOptions } from '@/api/useWallets'
import { walletItemsQueryOptions } from '@/api/useWalletItem'
import { usePaginatedQuery } from '@/utils/usePaginationQuery'
import WalletCard from '@/components/Wallet/WalletCard.vue'
import PaginationActions from '@/components/Pagination/PaginationActions.vue'
import { StateError, StateLoading, StateNull } from '@/components/States'
import { PhMagnifyingGlass, PhPlus, PhMinus, PhPencil, PhTrash } from '@phosphor-icons/vue'
import DeleteWallet from './components/DeleteWallet.vue'
import UpdateWallet from './components/UpdateWallet.vue'
import CreateWalletItem from '../wallet_item/components/CreateWalletItem.vue'
import UpdateWalletItem from '../wallet_item/components/UpdateWalletItem.vue'
import DeleteWalletItem from '../wallet_item/components/DeleteWalletItem.vue'
import { useDeleteWallet } from './hooks/useDeleteWallet'
import { useUpdateWallet } from './hooks/useUpdateWallet'
import { useCreateWalletItem } from '../wallet_item/hooks/useCreateWalletItem'
import { useDeleteWalletItem } from '../wallet_item/hooks/useDeleteWalletItem'
import { useUpdateWalletItem } from '../wallet_item/hooks/useUpdateWalletItem'
import { formatDate } from '@/utils/useDate'
import type { TWalletItem } from '../wallet_item/schema'
const { open: openDeleteWallet } = useDeleteWallet()
const { open: openUpdateWallet } = useUpdateWallet()
const { open: openCreateItem } = useCreateWalletItem()
const { open: openDeleteItem } = useDeleteWalletItem()
const { open: openUpdateItem } = useUpdateWalletItem()

const deleteItem = ref<TWalletItem>()
const openDeleteModal = (item: TWalletItem) => {
  deleteItem.value = item
  openDeleteItem()
}

const updateItem = ref<TWalletItem>()
const openUpdateModal = (item: TWalletItem) => {
  updateItem.value = item
  openUpdateItem()
}

const updateItemModalValue = computed(() => {
  if (!updateItem.value) return undefined
  return {
    ...updateItem.value,
    date: updateItem.value.date ?? undefined,
  }
})

const route = useRoute()
if (!route.params.walletId) {
  throw new Error('walletId param is required')
}
const walletId = computed(() => route.params.walletId as string)

// Wallet
const { data, isLoading, isError } = useQuery(computed(() => walletQueryOptions(walletId.value)))

// Wallet Items
const { page, sort, searchInput, filter, params } = usePaginatedQuery({
  limit: 10,
  sortByDefault: 'date',
})
const {
  data: wallet_items,
  isLoading: isItemsLoading,
  isError: isItemsError,
} = useQuery(computed(() => walletItemsQueryOptions(params.value, walletId.value)))
</script>

<style scoped></style>
