<template>
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
    <div
      class="card border border-base-content/20 rounded-box cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-transparent group relative overflow-hidden"
      v-for="wallet in items"
      :key="wallet.id"
      :style="{ '--wallet-color': wallet.color || '#e5e7eb' }"
      @click="onSelect(wallet.id)"
    >
      <!-- Light mode background -->
      <div
        class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 dark:opacity-0"
        style="
          background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--wallet-color) 5%, white) 0%,
            color-mix(in srgb, var(--wallet-color) 15%, white) 50%,
            color-mix(in srgb, var(--wallet-color) 25%, white) 100%
          );
        "
      ></div>
      <div class="p-4 space-y-6 relative z-10 transition-transform duration-300">
        <div class="flex justify-between">
          <PhCoins
            class="text-[32px]"
            :style="{
              fill: wallet.color,
              filter: `drop-shadow(0px 2px 4px ${wallet.color}, 0.2)`,
            }"
          />

          <p class="text-xs">{{ wallet.activity }} items</p>
        </div>

        <div class="w-full h-full z-20 relative flex justify-between items-end">
          <div class="flex flex-col gap-2 h-full">
            <div class="flex">
              <p
                class="text-xl lg:text-2xl tabular-nums font-bold"
                :class="wallet.balance! > 0 ? 'text-base-content' : ''"
                :style="wallet.balance! <= 0 ? { color: wallet.color ?? undefined } : {}"
              >
                {{ formatCurrency(wallet.balance!) }}
              </p>
            </div>
            <div>
              <p class="font-mono text-xs text-base-content/40">Wallet</p>
              <p class="font-semibold tracking-tight">
                {{ wallet.name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TWalletSummaryWithActivity } from '@/api/useDashboard'
import { PhCoins } from '@phosphor-icons/vue'
import { formatCurrency } from '@/utils/useDate'

defineProps<{
  items: TWalletSummaryWithActivity[]
}>()

const emit = defineEmits<{
  (e: 'select-wallet', id: string): void
}>()

const onSelect = (id: string) => {
  emit('select-wallet', id)
}
</script>
