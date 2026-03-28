<template>
  <div
    class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-emerald-500/30"
  >
    <div class="grid-overlay" />
    <div class="relative z-10 w-full max-w-lg">
      <div
        class="bg-white/50 backdrop-blur-2xl border border-slate-200 p-10 md:p-14 rounded-xl shadow-lg flex flex-col items-center gap-4"
      >
        <PhWarning size="42" class="text-primary drop-shadow-sm drop-shadow-emerald-500/40" />

        <!-- 404 Text -->
        <div class="text-center flex flex-col gap-2">
          <h1
            class="text-7xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-br from-emerald-400 via-emerald-600 to-emerald-600 drop-shadow-sm pb-1"
          >
            404
          </h1>
          <h2 class="text-2xl font-bold text-slate-800">Oops! You're lost.</h2>
          <p class="text-slate-500 font-medium leading-relaxed mx-auto">
            We couldn't find the page you were looking for. It might have been moved or deleted.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <button
            @click="goBack"
            class="btn btn-secondary font-bold text-sm transition-all shadow-md flex items-center justify-center"
          >
            <PhCaretLeft size="16" weight="bold" />
            Go Back
          </button>

          <button
            @click="goReset"
            class="btn btn-primary font-bold text-sm transition-all shadow-md flex items-center justify-center"
          >
            <PhHouse size="16" weight="bold" />
            <span>{{ $route.path === '/' ? 'Dashboard' : 'Home' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { PhWarning, PhHouse, PhCaretLeft } from '@phosphor-icons/vue'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}

const goReset = () => {
  if (router.currentRoute.value.path === '/') {
    router.push('/app/dashboard')
  } else {
    router.push('/')
  }
}
</script>

<style scoped></style>
