<template>
  <div
    class="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500/30 overflow-x-hidden pb-32"
  >
    <nav
      class="relative z-20 flex justify-between items-center py-6 px-6 md:px-12 max-w-7xl mx-auto w-full"
    >
      <div class="font-bold text-xl flex items-center gap-2 text-slate-900 tracking-tight">
        <div class="w-4 h-4 bg-emerald-500 rounded-sm shadow-sm shadow-emerald-500/20"></div>
        coinz
      </div>

      <div class="flex gap-4 items-center text-sm font-semibold">
        <RouterLink
          to="/login"
          class="text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
          >Sign in</RouterLink
        >
        <RouterLink
          to="/register"
          class="bg-emerald-500 text-white px-5 py-2.5 rounded-full hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/20"
        >
          Create an account
        </RouterLink>
      </div>
    </nav>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped></style>
