<script setup lang="ts">
import { computed } from 'vue'
import { type TWallet } from '@/modules/wallets/schema'
import { type TWalletSummaryWithActivity } from '@/api/useDashboard'
import { PhCoins, PhEyeSlash } from '@phosphor-icons/vue'
import { formatCurrency } from '@/utils/useDate'

const props = defineProps<{ wallet: TWallet | TWalletSummaryWithActivity }>()

function hexToRgb(hex: string) {
  const c = hex.replace('#', '')
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  }
}

const rgb = computed(() => hexToRgb(props.wallet.color!))
const glowShadow = computed(
  () => `0 4px 78px rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, 0.1)`,
)
</script>

<template>
  <div
    class="wallet-card rounded-box bg-base-100 overflow-hidden"
    :style="{ '--glow': glowShadow }"
  >
    <!-- <div class="blob" :style="blobMainStyle" />
    <div class="blob" :style="blobSecondaryStyle" /> -->

    <div class="glass-surface rounded-box p-6">
      <div class="flex items-center justify-between">
        <div class="flex gap-2 items-end">
          <PhCoins
            class="text-[38px]"
            :style="{
              fill: wallet.color,
              filter: `drop-shadow(0px 2px 4px ${wallet.color}, 0.2)`,
            }"
          />
        </div>
        <PhEyeSlash v-if="wallet.is_archived" size="32" :style="{ fill: wallet.color }" />
      </div>

      <div class="flex-1" />

      <div class="w-full h-full z-20 relative mt-2 lg:mt-6 flex justify-between items-end">
        <div class="flex flex-col gap-2 h-full">
          <div class="flex-1">
            <p
              class="text-xl lg:text-4xl tabular-nums font-bold"
              :class="wallet.balance! > 0 ? 'text-base-content' : ''"
              :style="wallet.balance! <= 0 ? { color: wallet.color ?? undefined } : {}"
            >
              {{ formatCurrency(wallet.balance!) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-base-content/60">Wallet</p>
            <p class="text-xl font-semibold tracking-tight">
              {{ wallet.name }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wallet-card {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  box-shadow:
    var(--glow),
    0 4px 16px rgba(0, 0, 0, 0.2);
  transition:
    transform 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
    box-shadow 250ms ease;
  cursor: pointer;
}

.wallet-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow:
    var(--glow),
    0 8px 24px rgba(0, 0, 0, 0.2);
}

.blob {
  position: absolute;
  filter: blur(60px);
  pointer-events: none;
  opacity: 0.85;
  transition: border-radius 600ms ease;
}

.glass-surface {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 0, 0, 0.15);
  z-index: 10;
}
</style>
