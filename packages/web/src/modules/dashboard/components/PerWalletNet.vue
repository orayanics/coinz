<template>
  <div class="stats rounded-xl border-dashed border border-base-content/20">
    <div v-if="walletBalance !== undefined && walletBalance !== null" class="stat">
      <div class="stat-title">Balance</div>
      <div class="stat-value">
        {{ formatCurrency(walletBalance) }}
      </div>
    </div>

    <div class="stat">
      <div class="stat-title">Income</div>
      <div class="stat-value text-success">
        {{ formatCurrency(income) }}
      </div>
    </div>

    <div class="stat">
      <div class="stat-title">Expense</div>
      <div class="stat-value text-error">
        {{ formatCurrency(expense) }}
      </div>
    </div>

    <div class="stat">
      <div class="stat-title">Net</div>
      <div class="stat-value" :class="net >= 0 ? 'text-success' : 'text-error'">
        {{ formatCurrency(net) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '@/utils/useDate'

defineProps<{
  walletBalance?: number | null
  income: number
  expense: number
  net: number
}>()
</script>
