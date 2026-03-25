<script setup lang="ts">
import { PhWarningCircle } from '@phosphor-icons/vue'

defineProps<{
  name: string
  balance: number
}>()
</script>

<template>
  <div class="flex items-end justify-between w-full gap-4 z-20 relative">
    <div class="flex flex-col gap-1">
      <p class="font-mono text-sm uppercase tracking-widest text-base-content/60">Wallet</p>
      <p class="font-mono font-medium text-xl truncate tracking-tight text-base-content">
        {{ name }}
      </p>
    </div>

    <div class="flex flex-col gap-1 items-end">
      <p class="font-mono text-sm uppercase tracking-widest text-base-content/60">Balance</p>
      <div
        class="font-mono text-xl tabular-nums flex items-center gap-2"
        :class="balance < 0 ? 'text-red-400' : 'text-base-content'"
      >
        <span>{{ balance.toFixed(2) }}</span>
        <PhWarningCircle v-if="balance < 0" weight="fill" />
      </div>
    </div>
  </div>
</template>
