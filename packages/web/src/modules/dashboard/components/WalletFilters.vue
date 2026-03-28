<template>
  <div class="grid md:grid-cols-1 lg:grid-cols-2 gap-4 items-center" id="wallet-list-section">
    <p class="font-semibold md:col-span-2 lg:col-span-1">Wallets</p>

    <div class="md:col-span-2 lg:col-span-1 flex flex-col lg:flex-row justify-end gap-2">
      <select class="select w-full" :value="sortBy" @change="onSortByChange">
        <option value="balance">Balance</option>
        <option value="name">Name</option>
        <option value="activity">Activity</option>
      </select>

      <select class="select w-full" :value="sort" @change="onSortChange">
        <option value="desc">Desc</option>
        <option value="asc">Asc</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
type SortBy = 'balance' | 'name' | 'activity'
type Sort = 'asc' | 'desc'

defineProps<{
  sortBy: SortBy
  sort: Sort
}>()

const emit = defineEmits<{
  (e: 'update:sortBy', value: SortBy): void
  (e: 'update:sort', value: Sort): void
}>()

const onSortByChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value as SortBy
  emit('update:sortBy', value)
}

const onSortChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value as Sort
  emit('update:sort', value)
}
</script>
