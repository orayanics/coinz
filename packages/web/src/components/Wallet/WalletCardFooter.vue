<script setup lang="ts">
import { PhWarningCircle } from '@phosphor-icons/vue'

defineProps<{
  name: string
  balance: number
}>()
</script>

<template>
  <div class="w-full z-20 relative">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <div
          class="font-mono text-xl tabular-nums flex items-center gap-2"
          :class="
            balance < 0 ? 'text-error drop-shadow-xs drop-shadow-rose-900' : 'text-base-content'
          "
        >
          <span>
            {{
              Number(balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </span>
          <PhWarningCircle v-if="balance < 0" weight="fill" />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <p class="font-mono text-xs leading-0 uppercase tracking-widest text-base-content/60">
          Wallet
        </p>
        <p class="font-mono font-medium truncate overflow-hidden tracking-tight text-base-content">
          {{ name }}
        </p>
      </div>
    </div>
  </div>
</template>
