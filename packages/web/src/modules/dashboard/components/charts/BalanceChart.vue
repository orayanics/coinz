<template>
  <div class="chart-shell" ref="shell">
    <div
      v-if="tooltip.visible"
      class="chart-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <span class="text-xs">{{ tooltip.date }}</span>
      <span class="text-xs font-semibold" :class="tooltip.value >= 0 ? 'pos' : 'neg'">
        {{ formatCurrency(tooltip.value) }}
      </span>
    </div>

    <svg
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="xMidYMid meet"
      class="chart-svg"
      @mousemove="onMove"
      @mouseleave="tooltip.visible = false"
    >
      <defs>
        <linearGradient id="bal-pos" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#60a5fa" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="bal-neg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f87171" stop-opacity="0" />
          <stop offset="100%" stop-color="#f87171" stop-opacity="0.3" />
        </linearGradient>
        <filter id="bal-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="bal-clip">
          <rect :x="PAD" :y="0" :width="W - PAD * 2" :height="H - PAD" />
        </clipPath>
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
        :stroke-dasharray="tick.value === 0 ? '4 3' : 'none'"
      />
      <!-- Zero line accent -->
      <line
        v-if="zeroY >= PAD && zeroY <= H - PAD"
        :x1="PAD"
        :y1="zeroY"
        :x2="W - PAD"
        :y2="zeroY"
        stroke="rgba(0,0,0,0.15)"
        stroke-width="1"
        stroke-dasharray="4 3"
      />

      <!-- Y labels -->
      <text
        v-for="tick in yTicks"
        :key="'yl-' + tick.y"
        :x="PAD - 6"
        :y="tick.y + 4"
        text-anchor="end"
        class="fill-base-content text-[6px]"
      >
        {{ formatCompact(tick.value) }}
      </text>

      <!-- Positive area fill -->
      <path :d="posAreaPath" fill="url(#bal-pos)" clip-path="url(#bal-clip)" class="area-path" />
      <!-- Negative area fill -->
      <path :d="negAreaPath" fill="url(#bal-neg)" clip-path="url(#bal-clip)" class="area-path" />

      <!-- Stroke -->
      <path
        :d="splinePath"
        fill="none"
        stroke="#60a5fa"
        stroke-width=""
        stroke-linecap="round"
        stroke-linejoin="round"
        filter="url(#bal-glow)"
        clip-path="url(#bal-clip)"
        class="line-path"
      />

      <!-- Hover dots -->
      <g>
        <circle
          v-for="(pt, i) in chartPoints"
          :key="i"
          :cx="pt.cx"
          :cy="pt.cy"
          r="1.5"
          :fill="pt.value >= 0 ? '#60a5fa' : '#f87171'"
          class="hover-dot"
          :class="{ active: tooltip.index === i }"
        />
      </g>

      <!-- X labels -->
      <text
        v-for="(pt, i) in xLabelPoints"
        :key="i"
        :x="pt.cx"
        :y="H - 4"
        text-anchor="middle"
        class="fill-base-content text-[6px]"
      >
        {{ pt.label }}
      </text>
    </svg>

    <p v-if="!chartPoints.length" class="empty-msg">No transactions recorded yet.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { formatCurrency, formatCompact } from '@/utils/useDate'

type BalancePoint = { date: string | null; balance: number }
const props = defineProps<{ points: BalancePoint[] }>()

const W = 800
const H = 200
const PAD = 30
const shell = ref<HTMLElement | null>(null)
const tooltip = reactive({ visible: false, x: 0, y: 0, date: '', value: 0, index: -1 })

const validPoints = computed(
  () => props.points.filter((p) => p.date !== null) as { date: string; balance: number }[],
)

const minVal = computed(() => Math.min(...validPoints.value.map((p) => p.balance), 0))
const maxVal = computed(() => Math.max(...validPoints.value.map((p) => p.balance), 1))

const chartPoints = computed(() =>
  validPoints.value.map((p, i) => ({
    cx: PAD + (i / Math.max(validPoints.value.length - 1, 1)) * (W - PAD * 2),
    cy: PAD + (1 - (p.balance - minVal.value) / (maxVal.value - minVal.value)) * (H - PAD * 2),
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: p.balance,
    label: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  })),
)

const zeroY = computed(() => {
  const range = maxVal.value - minVal.value
  if (range === 0) return H / 2
  return PAD + (1 - (0 - minVal.value) / range) * (H - PAD * 2)
})

// Catmull-Rom spline → cubic bezier
const splinePath = computed(() => {
  const pts = chartPoints.value
  if (pts.length < 2) return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx},${p.cy}`).join(' ')
  let d = `M${pts[0]?.cx},${pts[0]?.cy}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[Math.min(i + 2, pts.length - 1)]!
    const cp1x = p1.cx + (p2.cx - p0.cx) / 6
    const cp1y = p1.cy + (p2.cy - p0.cy) / 6
    const cp2x = p2.cx - (p3.cx - p1.cx) / 6
    const cp2y = p2.cy - (p3.cy - p1.cy) / 6
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.cx},${p2.cy}`
  }
  return d
})

const posAreaPath = computed(() => {
  if (!chartPoints.value.length) return ''
  const baseline = Math.min(zeroY.value, H - PAD)
  const first = chartPoints.value[0]!
  const last = chartPoints.value[chartPoints.value.length - 1]!
  return `${splinePath.value} L${last.cx},${baseline} L${first.cx},${baseline} Z`
})

const negAreaPath = computed(() => {
  if (!chartPoints.value.length) return ''
  const baseline = Math.max(zeroY.value, PAD)
  const first = chartPoints.value[0]!
  const last = chartPoints.value[chartPoints.value.length - 1]!
  return `${splinePath.value} L${last.cx},${baseline} L${first.cx},${baseline} Z`
})

const yTicks = computed(() =>
  Array.from({ length: 4 }, (_, i) => {
    const f = i / 3
    return {
      y: PAD + (1 - f) * (H - PAD * 2),
      value: minVal.value + f * (maxVal.value - minVal.value),
    }
  }),
)

const xLabelPoints = computed(() => {
  if (chartPoints.value.length <= 1) return chartPoints.value
  const step = Math.max(1, Math.floor(chartPoints.value.length / 5))
  return chartPoints.value.filter((_, i) => i % step === 0 || i === chartPoints.value.length - 1)
})

const onMove = (e: MouseEvent) => {
  if (!shell.value || !chartPoints.value.length) return
  const rect = shell.value.getBoundingClientRect()
  const svgX = ((e.clientX - rect.left) / rect.width) * W
  let closest = 0,
    minDist = Infinity
  chartPoints.value.forEach((p, i) => {
    const d = Math.abs(p.cx - svgX)
    if (d < minDist) {
      minDist = d
      closest = i
    }
  })
  const p = chartPoints.value[closest]
  if (!p) return
  tooltip.visible = true
  tooltip.x = (p.cx / W) * rect.width - 56
  tooltip.y = (p.cy / H) * rect.height - 48
  tooltip.date = p.date
  tooltip.value = p.value
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
.axis-label {
  font-size: 9px;
  fill: rgba(255, 255, 255, 0.3);
  font-family: 'DM Mono', monospace;
}
.hover-dot {
  opacity: 0;
  transition: opacity 0.15s;
}
.hover-dot.active {
  opacity: 1;
}
.chart-shell:hover .hover-dot {
  opacity: 0.35;
}
.chart-shell:hover .hover-dot.active {
  opacity: 1;
}
.line-path {
  stroke-dasharray: 1400;
  stroke-dashoffset: 1400;
  animation: draw 1.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.area-path {
  opacity: 0;
  animation: fadein 1.5s ease forwards;
}
@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes fadein {
  to {
    opacity: 1;
  }
}
.chart-tooltip {
  position: absolute;
  pointer-events: none;
  background: rgba(255, 255, 255, 0);
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
.pos {
  color: #60a5fa;
}
.neg {
  color: #f87171;
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
