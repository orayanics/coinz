<script setup lang="ts">
import { PhCoins } from '@phosphor-icons/vue'
</script>

<template>
  <div class="chip">
    <svg width="0" height="0" class="absolute">
      <defs>
        <filter id="emboss-glass" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="6"
            flood-color="rgba(0,0,0,0.35)"
            result="shadow"
          />
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feOffset dx="-1" dy="-1.5" result="offset" />
          <feComposite in="SourceGraphic" in2="offset" operator="over" result="raised" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="raised" />
          </feMerge>
        </filter>
      </defs>
    </svg>
    <PhCoins weight="thin" class="chip-icon" />
  </div>
</template>

<style scoped>
.chip {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 20;
}

.chip-icon {
  height: 2.5rem;
  width: auto;
  filter: url(#emboss-glass) drop-shadow(0 1px 1px rgba(255, 255, 255, 0.3));
  color: rgba(255, 255, 255, 0.72);
  opacity: 0.9;
}
</style>
