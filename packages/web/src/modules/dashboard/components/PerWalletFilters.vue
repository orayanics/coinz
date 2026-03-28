<template>
  <div class="flex flex-col gap-4">
    <div class="flex md:flex-row flex-col gap-2 justify-between">
      <RouterLink :to="`/app/wallets/${props.wallet_id}`" class="flex items-center">
        <PhWallet class="inline-block text-2xl mr-2" />
        <p class="text-2xl font-semibold truncate">{{ props.wallet_name }}</p>
      </RouterLink>

      <button class="block md:hidden btn btn-primary" @click="scrollWallet">
        Scroll to Wallets
      </button>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
      <select class="select col-span-1" :value="month ?? ''" @change="onMonthChange">
        <option value="">All months</option>
        <option v-for="m in months" :key="m.value" :value="m.value">
          {{ m.label }}
        </option>
      </select>

      <select class="select col-span-1" :value="year ?? ''" @change="onYearChange">
        <option value="">All years</option>
        <option v-for="y in years" :key="y" :value="y">
          {{ y }}
        </option>
      </select>

      <select :value="type ?? ''" class="select col-span-1" @change="onTypeChange">
        <option value="">All types</option>
        <option value="INCOME">Income</option>
        <option value="EXPENSE">Expense</option>
      </select>

      <select :value="granularity ?? ''" class="select col-span-1" @change="onGranularityChange">
        <option value="month">Monthly</option>
        <option value="week">Weekly</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhWallet } from '@phosphor-icons/vue'
import { RouterLink } from 'vue-router'

type MonthOption = {
  label: string
  value: number
}

const props = defineProps<{
  wallet_name: string
  month?: number
  year?: number
  type?: string
  granularity?: string
  months: MonthOption[]
  years: number[]
  wallet_id?: string
}>()

const emit = defineEmits<{
  (e: 'update:month', value: number | undefined): void
  (e: 'update:year', value: number | undefined): void
  (e: 'update:type', value: string | undefined): void
  (e: 'update:granularity', value: string | undefined): void
}>()

const onMonthChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value
  emit('update:month', value === '' ? undefined : Number(value))
}

const onYearChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value
  emit('update:year', value === '' ? undefined : Number(value))
}

const onTypeChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value
  emit('update:type', value === '' ? undefined : value)
}

const onGranularityChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value
  emit('update:granularity', value === '' ? undefined : value)
}

const scrollWallet = async () => {
  const el = document.getElementById('wallet-list-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>
