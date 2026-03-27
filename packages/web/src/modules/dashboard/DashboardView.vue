<template>
  <div class="flex flex-col gap-6 min-h-full">
    <!-- Overview -->
    <OverviewFilters
      v-model:month="month"
      v-model:year="year"
      v-model:include-archived="includeArchived"
      :months="MONTHS"
      :years="YEARS"
    />
    <StateLoading v-if="overviewLoading" />
    <StateError v-else-if="overviewError" />
    <StateNull v-else-if="!overview" />
    <OverviewStats v-else :overview="overview" />

    <!-- ── Wallets -->
    <WalletFilters v-model:sort="listSort" v-model:sort-by="listSortBy" />
    <StateLoading v-if="walletListLoading" />
    <StateError v-else-if="walletListError" />
    <StateNull v-else-if="!walletList?.items.length" />
    <WalletList v-else :items="walletList.items" @select-wallet="selectWallet" />
    <PaginationActions
      v-if="walletList"
      v-model:page="page"
      :total-pages="walletList.meta.total_pages"
      :total="walletList.meta.total"
    />

    <!-- Per-wallet -->
    <template v-if="selectedWalletId">
      <div class="divider h-1! my-0!" id="per-wallet-section" />
      <PerWalletFilters
        :wallet_name="drilldownData?.wallet.name ?? ''"
        v-model:month="drillMonth"
        v-model:year="drillYear"
        v-model:type="drillType"
        v-model:granularity="drillGranularity"
        :months="MONTHS"
        :years="YEARS"
        :wallet_id="selectedWalletId"
      />

      <StateLoading v-if="drilldownLoading" />
      <StateError v-else-if="drilldownError" />
      <StateNull v-else-if="!drilldownData" />

      <template v-else-if="drilldownData">
        <PerWalletNet
          :wallet-balance="drilldownData.wallet.balance"
          :income="drilldownData.net_change.income"
          :expense="drilldownData.net_change.expense"
          :net="drilldownData.net_change.net"
        />
        <PerWalletTransactions
          :average="drilldownData.average_transaction.average"
          :count="drilldownData.average_transaction.count"
          :max="drilldownData.average_transaction.max"
          :min="drilldownData.average_transaction.min"
        />

        <!-- Balance over time -->
        <div
          v-if="drilldownData.balance_over_time.length"
          class="border-dashed border border-base-content/20 card p-4 gap-2"
        >
          <p class="font-semibold text-sm">Balance Over Time</p>
          <BalanceChart :points="drilldownData.balance_over_time" />
        </div>

        <!-- Spending by period -->
        <div
          v-if="drilldownData.spending_by_period.length"
          class="border-dashed border border-base-content/20 card p-4 gap-2"
        >
          <p class="font-semibold text-sm">
            {{ drillGranularity === 'week' ? 'Weekly' : 'Monthly' }} Breakdown
          </p>
          <SpendingChart :periods="drilldownData.spending_by_period" />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'

import {
  useCrossWalletQuery,
  useDashboardWalletListQuery,
  useWalletDashboardQuery,
} from '@/utils/useDashboardQuery'

import {
  crossWalletDashboardQueryOptions,
  dashboardWalletListQueryOptions,
  walletDashboardQueryOptions,
} from '@/api/useDashboard'

import { StateError, StateLoading, StateNull } from '@/components/States'
import BalanceChart from './components/charts/BalanceChart.vue'
import SpendingChart from './components/charts/SpendingChart.vue'
import PaginationActions from '@/components/Pagination/PaginationActions.vue'
import OverviewFilters from './components/OverviewFilters.vue'
import OverviewStats from './components/OverviewStats.vue'
import WalletFilters from './components/WalletFilters.vue'
import WalletList from './components/WalletList.vue'
import PerWalletFilters from './components/PerWalletFilters.vue'
import PerWalletNet from './components/PerWalletNet.vue'
import PerWalletTransactions from './components/PerWalletTransactions.vue'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)
const MONTHS = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
]

// Overview
const { params: overviewParams, includeArchived, month, year } = useCrossWalletQuery()
const {
  isLoading: overviewLoading,
  isError: overviewError,
  data: overview,
} = useQuery(computed(() => crossWalletDashboardQueryOptions(overviewParams.value)))

// Wallets
const {
  page,
  params: listParams,
  sort: listSort,
  sortBy: listSortBy,
} = useDashboardWalletListQuery()
const {
  isLoading: walletListLoading,
  isError: walletListError,
  data: walletList,
} = useQuery(computed(() => dashboardWalletListQueryOptions(listParams.value)))

// Per-wallet
const selectedWalletId = ref<string | null>(null)
const selectWallet = async (id: string) => {
  selectedWalletId.value = id
  await nextTick()
  const el = document.getElementById('per-wallet-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
const {
  params: drillParams,
  month: drillMonth,
  year: drillYear,
  type: drillType,
  granularity: drillGranularity,
} = useWalletDashboardQuery()
const {
  isLoading: drilldownLoading,
  isError: drilldownError,
  data: drilldownData,
} = useQuery(
  computed(() => walletDashboardQueryOptions(selectedWalletId.value ?? '', drillParams.value)),
)
</script>
