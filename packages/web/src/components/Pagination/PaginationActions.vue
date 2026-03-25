<template>
  <div class="flex items-center justify-between">
    <span class="text-sm text-base-content/80">{{ total }} total</span>
    <div class="join">
      <button
        class="join-item btn btn-sm"
        :disabled="page <= 1"
        @click="$emit('update:page', page - 1)"
      >
        <PhArrowLineLeft />
      </button>
      <button class="join-item btn btn-sm">{{ page }} / {{ totalPages }}</button>
      <button
        class="join-item btn btn-sm"
        :disabled="page >= totalPages"
        @click="$emit('update:page', page + 1)"
      >
        <PhArrowLineRight />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhArrowLineLeft, PhArrowLineRight } from '@phosphor-icons/vue'
defineProps<{ page: number; totalPages: number; total: number }>()
defineEmits<{ 'update:page': [page: number] }>()
</script>
