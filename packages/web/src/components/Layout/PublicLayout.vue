<template>
  <div
    class="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/30 overflow-x-hidden"
  >
    <nav class="flex justify-between items-center py-6 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <RouterLink
        to="/"
        class="font-bold text-xl flex items-center gap-2 text-slate-900 tracking-tight"
      >
        <div class="w-4 h-4 bg-emerald-500 rounded-sm shadow-sm shadow-emerald-500/20"></div>
        coinz
      </RouterLink>

      <div class="flex gap-4 items-center text-sm font-semibold">
        <RouterLink
          to="/login"
          class="text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
          >Login</RouterLink
        >
        <RouterLink to="/register" class="btn btn-primary shadow-md shadow-emerald-400/20">
          Create an account
        </RouterLink>
      </div>
    </nav>

    <div class="flex-1 flex flex-col min-h-0">
      <RouterView v-slot="{ Component }">
        <component :is="Component" class="flex-1" />
      </RouterView>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped></style>
