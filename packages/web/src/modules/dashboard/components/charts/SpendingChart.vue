<template>
  <div class="chart-shell" ref="shell">
    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      class="chart-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <span class="text-xs font-semibold">{{ tooltip.period }}</span>
      <div class="tooltip-row">
        <span class="h-2 w-2 rounded-full bg-success shadow shadow-success" />
        <span class="text-xs">Income</span>
        <span class="text-xs font-semibold">{{ formatCurrency(tooltip.income) }}</span>
      </div>
      <div class="tooltip-row">
        <span class="h-2 w-2 rounded-full bg-error shadow shadow-error" />
        <span class="text-xs">Expense</span>
        <span class="text-xs font-semibold">{{ formatCurrency(tooltip.expense) }}</span>
      </div>
      <div class="tooltip-divider" />
      <div class="tooltip-row">
        <span class="text-xs">Net</span>
        <span
          class="text-xs font-semibold"
          :class="tooltip.net >= 0 ? 'text-secondary' : 'text-accent'"
        >
          {{ formatCurrency(tooltip.net) }}
        </span>
      </div>
    </div>

    <svg
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid meet"
      class="chart-svg"
      @mousemove="onMove"
      @mouseleave="tooltip.visible = false"
    >
      <defs>
        <linearGradient id="sp-income" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00d492" />
          <stop offset="100%" stop-color="#00d492" stop-opacity="0.7" />
        </linearGradient>
        <linearGradient id="sp-expense" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff637e" />
          <stop offset="100%" stop-color="#ff637e" stop-opacity="0.7" />
        </linearGradient>
        <filter id="sp-glow-v" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2 2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sp-glow-o" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2 2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Grid -->
      <line
        v-for="tick in yTicks"
        :key="tick.y"
        :x1="PAD"
        :y1="tick.y"
        :x2="W - PAD"
        :y2="tick.y"
        stroke="rgba(0,0,0,0.05)"
        stroke-width="1"
      />
      <text
        v-for="tick in yTicks"
        :key="'yl' + tick.y"
        :x="PAD - 6"
        :y="tick.y + 4"
        text-anchor="end"
        class="fill-base-content text-[6px]"
      >
        {{ formatCompact(tick.value) }}
      </text>

      <!-- Bars -->
      <g v-for="(bar, i) in bars" :key="i">
        <!-- Net indicator line on top -->
        <line
          :x1="bar.cx - BAR_W / 2 + 2"
          :y1="bar.netY"
          :x2="bar.cx + BAR_W / 2 - 2"
          :y2="bar.netY"
          :stroke="bar.net >= 0 ? '#a78bfa' : '#fb923c'"
          stroke-width="1.5"
          stroke-linecap="round"
          :opacity="tooltip.index === i ? 1 : 0.5"
        />
        <!-- Income segment -->
        <rect
          :x="bar.cx - BAR_W / 2"
          :y="bar.incomeY"
          :width="BAR_W"
          :height="bar.incomeH"
          rx="2"
          fill="url(#sp-income)"
          :filter="tooltip.index === i ? 'url(#sp-glow-v)' : ''"
          class="bar"
          :style="{ animationDelay: i * 50 + 'ms' }"
        />
        <!-- Expense segment (stacked below) -->
        <rect
          :x="bar.cx - BAR_W / 2"
          :y="bar.expenseY"
          :width="BAR_W"
          :height="bar.expenseH"
          rx="2"
          fill="url(#sp-expense)"
          :filter="tooltip.index === i ? 'url(#sp-glow-o)' : ''"
          class="bar"
          :style="{ animationDelay: i * 50 + 25 + 'ms' }"
        />

        <!-- X label -->
        <text :x="bar.cx" :y="H - 4" text-anchor="middle" class="fill-base-content text-[6px]">
          {{ bar.label }}
        </text>
      </g>
    </svg>

    <!-- Legend -->
    <div class="legend">
      <span class="text-xs flex items-center gap-2"
        ><div class="h-2 w-2 rounded-full bg-success shadow shadow-emerald-400" />
        Income</span
      >
      <span class="text-xs flex items-center gap-2">
        <div class="h-2 w-2 rounded-full bg-error shadow shadow-rose-400" />
        Expense
      </span>
      <span class="text-xs flex items-center gap-2">
        <div class="h-2 w-2 rounded-full bg-secondary shadow shadow-secondary" />
        NET
      </span>
    </div>

    <p v-if="!bars.length" class="empty-msg">No period data available.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { formatCurrency, formatCompact } from '@/utils/useDate'
import type { TSpendingPeriod } from '@/api/useDashboard'

const props = defineProps<{ periods: TSpendingPeriod[] }>()

const W = 800
const H = 210
const PAD = 40
const shell = ref<HTMLElement | null>(null)
const tooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  period: '',
  income: 0,
  expense: 0,
  net: 0,
  index: -1,
})

const maxVal = computed(() => Math.max(...props.periods.map((p) => p.income + p.expense), 1))

const BAR_W = computed(() => {
  if (!props.periods.length) return 20
  return Math.max(8, Math.min(36, (W - PAD * 2) / props.periods.length - 10))
})

const chartH = H - PAD * 2

const baseline = computed(() => PAD + chartH)

const bars = computed(() =>
  props.periods.map((p, i) => {
    const cx = PAD + (i + 0.5) * ((W - PAD * 2) / props.periods.length)
    const incomeH = (p.income / maxVal.value) * chartH
    const expenseH = (p.expense / maxVal.value) * chartH
    const totalH = incomeH + expenseH
    const netY = baseline.value - totalH

    // Format label: "2024-03" → "Mar" or "2024-W12" → "W12"
    let label = p.period
    if (/^\d{4}-\d{2}$/.test(p.period)) {
      const [yr, mo] = p.period.split('-')
      label = new Date(Number(yr), Number(mo) - 1).toLocaleDateString('en-US', { month: 'short' })
    }

    return {
      cx,
      incomeY: baseline.value - incomeH,
      incomeH,
      expenseY: baseline.value - incomeH - expenseH,
      expenseH,
      netY,
      net: p.net,
      income: p.income,
      expense: p.expense,
      period: p.period,
      label,
    }
  }),
)

const yTicks = computed(() =>
  Array.from({ length: 4 }, (_, i) => {
    const f = i / 3
    return { y: PAD + (1 - f) * chartH, value: f * maxVal.value }
  }),
)

const onMove = (e: MouseEvent) => {
  if (!shell.value || !bars.value.length) return
  const rect = shell.value.getBoundingClientRect()
  const svgX = ((e.clientX - rect.left) / rect.width) * W
  let closest = 0,
    minDist = Infinity
  bars.value.forEach((b, i) => {
    const d = Math.abs(b.cx - svgX)
    if (d < minDist) {
      minDist = d
      closest = i
    }
  })
  const b = bars.value[closest]
  if (!b) return
  tooltip.visible = true
  tooltip.x = (b.cx / W) * rect.width - 80
  tooltip.y = 8
  tooltip.period = b.period
  tooltip.income = b.income
  tooltip.expense = b.expense
  tooltip.net = b.net
  tooltip.index = closest
}
</script>

<style scoped>
.chart-shell {
  position: relative;
  max-width: 100vw;
  overflow: auto;
}
.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}
.bar {
  transform-origin: bottom;
  transform-box: fill-box;
  animation: rise 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}
@keyframes rise {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}
.legend {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-right: 8px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'DM Mono', monospace;
}
.chart-tooltip {
  position: absolute;
  pointer-events: none;
  background: rgba(253, 253, 253, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(220, 220, 220, 0.45);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 10;
  min-width: 112px;
}
.tooltip-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.tooltip-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 2px 0;
}
.empty-msg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
}
</style>
