<template>
  <div class="stats border-dashed border border-base-content/20">
    <div class="stat">
      <div class="stat-title">Avg Transaction</div>
      <div class="stat-value">
        {{ formatCurrency(average) }}
      </div>
      <div class="stat-desc">{{ count }} total</div>
    </div>

    <div class="stat">
      <div class="stat-title">Largest</div>
      <div class="stat-value">
        {{ formatCurrency(max) }}
      </div>
    </div>

    <div class="stat">
      <div class="stat-title">Smallest</div>
      <div class="stat-value">
        {{ formatCurrency(min) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency } from '@/utils/useDate'

defineProps<{
  average: number
  count: number
  max: number
  min: number
}>()
</script>
