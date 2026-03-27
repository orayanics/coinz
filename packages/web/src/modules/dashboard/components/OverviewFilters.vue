<template>
  <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 items-center">
    <!-- Month -->
    <select class="select col-span-1" :value="month ?? ''" @change="onMonthChange">
      <option value="">All months</option>
      <option v-for="m in months" :key="m.value" :value="m.value">
        {{ m.label }}
      </option>
    </select>

    <!-- Year -->
    <select class="select col-span-1" :value="year ?? ''" @change="onYearChange">
      <option value="">All years</option>
      <option v-for="y in years" :key="y" :value="y">
        {{ y }}
      </option>
    </select>

    <!-- Include archived -->
    <label class="flex items-center gap-2 cursor-pointer col-span-2 md:col-span-1">
      <input
        type="checkbox"
        class="checkbox checkbox-sm"
        :checked="includeArchived"
        @change="onArchivedChange"
      />
      <span class="text-sm">Show archived</span>
    </label>
  </div>
</template>

<script setup lang="ts">
type MonthOption = {
  label: string
  value: number
}

defineProps<{
  month?: number
  year?: number
  includeArchived: boolean
  months: MonthOption[]
  years: number[]
}>()

const emit = defineEmits<{
  (e: 'update:month', value: number | undefined): void
  (e: 'update:year', value: number | undefined): void
  (e: 'update:includeArchived', value: boolean): void
}>()

const onMonthChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value
  emit('update:month', value === '' ? undefined : Number(value))
}

const onYearChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value
  emit('update:year', value === '' ? undefined : Number(value))
}

const onArchivedChange = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  emit('update:includeArchived', checked)
}
</script>
