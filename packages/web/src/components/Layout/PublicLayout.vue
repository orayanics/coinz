<template>
  <div class="h-screen flex flex-col">
    <header
      class="flex justify-between items-center w-screen border-b border-neutral-600 py-2 px-4 gap-4"
    >
      <div>
        <RouterLink to="/">
          <PhCoins size="32" />
        </RouterLink>
      </div>
      <div class="flex gap-4">
        <RouterLink to="/register" active-class="text-accent"> Register </RouterLink>
        <RouterLink to="/login" active-class="text-accent"> Login </RouterLink>
      </div>
    </header>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { PhCoins } from '@phosphor-icons/vue'
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped></style>
