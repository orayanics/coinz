<template v-else-if="overview">
  <!-- Aggregate balance + income/expense summary -->
  <div class="stats border-dashed border border-base-content/20">
    <div class="stat">
      <div class="stat-title">Total Balance</div>
      <div class="stat-value">{{ formatCurrency(overview.aggregate_balance.total) }}</div>
      <div class="stat-desc">{{ overview.aggregate_balance.count_wallets }} wallet(s)</div>
    </div>

    <div class="stat">
      <div class="stat-title">Total Income</div>
      <div class="stat-value text-success">
        {{ formatCurrency(overview.income_vs_expense.total_income) }}
      </div>
    </div>

    <div class="stat">
      <div class="stat-title">Total Expenses</div>
      <div class="stat-value text-error">
        {{ formatCurrency(overview.income_vs_expense.total_expense) }}
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
