<template v-else-if="overview">
  <div>
    <div class="grid md:grid-cols-3 grid-cols-1 gap-4">
      <div
        class="bg-linear-to-br from-purple-400 via-purple-500 to-purple-700 px-6 py-6 rounded-xl"
      >
        <div class="text-white font-bold leading-relaxed">Total Balance</div>
        <div class="text-white text-3xl font-bold truncate">
          {{ formatCurrency(overview.aggregate_balance.total) }}
        </div>
        <div class="text-white text-xs">
          {{ overview.aggregate_balance.count_wallets }} wallet(s)
        </div>
      </div>

      <div
        class="bg-linear-to-br from-emerald-400 via-emerald-500 to-emerald-700 px-6 py-6 rounded-xl"
      >
        <div class="text-white font-bold leading-relaxed">Total Income</div>
        <div class="text-white text-3xl font-bold truncate">
          {{ formatCurrency(overview.income_vs_expense.total_income) }}
        </div>
      </div>

      <div class="bg-linear-to-br from-rose-400 via-rose-600 to-rose-800 px-6 py-6 rounded-xl">
        <div class="text-white font-bold leading-relaxed">Total Expenses</div>
        <div class="text-white text-3xl font-bold truncate">
          {{ formatCurrency(overview.income_vs_expense.total_expense) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '@/utils/useDate'
import type { TCrossWalletDashboard } from '@/api/useDashboard'

defineProps<{
  overview: TCrossWalletDashboard
}>()
</script>
