<script setup lang="ts">
import { computed } from 'vue'
import WalletCardChip from './WalletCardChip.vue'
import WalletCardFooter from './WalletCardFooter.vue'
import { type TWallet } from '@/modules/wallets/schema'

const props = defineProps<{ wallet: TWallet }>()

function hexToRgb(hex: string) {
  const c = hex.replace('#', '')
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  }
}

const rgb = computed(() => hexToRgb(props.wallet.color))
const blobColor = computed(() => `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, 0.95)`)
const blobColorAlt = computed(() => `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, 0.35)`)
const glowShadow = computed(
  () => `0 4px 78px rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, 0.12)`,
)

function seededRand(seed: number, index: number): number {
  const x = Math.sin(seed * 9301 + index * 49297 + 233) * 10000
  return x - Math.floor(x)
}

function blobRadius(seed: number, offset: number): string {
  const v = Array.from({ length: 8 }, (_, i) =>
    Math.round(100 + seededRand(seed, offset + i) * 50),
  ) as [number, number, number, number, number, number, number, number]

  return `${v[0]}% ${100 - v[0]}% ${100 - v[1]}% ${v[1]}% / ${v[2]}% ${v[3]}% ${100 - v[3]}% ${100 - v[2]}%`
}

const seed = computed(() => {
  let hash = 0
  for (let i = 0; i < props.wallet.id.length; i++) {
    hash = props.wallet.id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
})

const blobMainStyle = computed(() => ({
  background: blobColor.value,
  borderRadius: blobRadius(seed.value, 0),
  width: `${Math.round(55 + seededRand(seed.value, 140) * 25)}%`,
  height: `${Math.round(50 + seededRand(seed.value, 201) * 25)}%`,
  top: `${Math.round(seededRand(seed.value, 12) * 30)}%`,
  left: `${Math.round(10 + seededRand(seed.value, 293) * 40)}%`,
}))

const blobSecondaryStyle = computed(() => ({
  background: blobColorAlt.value,
  borderRadius: blobRadius(seed.value, 20),
  width: `${Math.round(35 + seededRand(seed.value, 21) * 25)}%`,
  height: `${Math.round(35 + seededRand(seed.value, 22) * 20)}%`,
  bottom: `${Math.round(-10 + seededRand(seed.value, 23) * 25)}%`,
  right: `${Math.round(-10 + seededRand(seed.value, 24) * 30)}%`,
}))
</script>

<template>
  <div class="wallet-card bg-base-100 overflow-hidden" :style="{ '--glow': glowShadow }">
    <div class="blob" :style="blobMainStyle" />
    <div class="blob" :style="blobSecondaryStyle" />

    <div class="glass-surface">
      <div class="flex items-start justify-between">
        <WalletCardChip />
      </div>

      <div class="flex-1" />

      <WalletCardFooter :name="wallet.name" :balance="wallet.balance" />
    </div>
  </div>
</template>

<style scoped>
.wallet-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1.6;
  border-radius: 20px;
  box-shadow:
    var(--glow),
    0 8px 16px rgba(0, 0, 0, 0.4);
  transition:
    transform 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
    box-shadow 250ms ease;
  cursor: pointer;
}

.wallet-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow:
    var(--glow),
    0 12px 24px rgba(0, 0, 0, 0.5);
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
  padding: 24px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.04) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  z-index: 10;
}
</style>
