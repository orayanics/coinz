<template>
  <div>
    <!-- Hero Section -->
    <main class="relative pt-34 pb-16 px-6 text-center flex flex-col items-center z-10">
      <div class="grid-overlay" />
      <div class="arch-overlay" />
      <div class="inline-flex items-center mt-0 md:mt-16 gap-2 px-3 py-1.5 mb-8">
        <span class="flex relative px-2 md:px-6">
          <PhCoins size="62" class="text-emerald-500 drop-shadow-sm drop-shadow-emerald-500/40" />
        </span>
      </div>
      <h1
        class="text-5xl md:text-[5.5rem] font-bold tracking-tighter text-slate-900 max-w-4xl leading-[1.1] mb-6"
      >
        Manage your <span class="hover:text-emerald-500 transition-colors">money</span>,
        <br class="hidden md:block" />
        your <span class="hover:text-emerald-500 transition-colors">wallets</span>, your
        <span class="hover:text-emerald-500 transition-colors">way</span>.
      </h1>

      <p class="text-lg text-slate-500 mb-10 max-w-xl mx-auto font-medium leading-relaxed">
        Open-source personal finance management software built for everyone. Track your expenses,
        set budgets, and achieve your financial goals with ease.
      </p>

      <RouterLink
        to="/register"
        class="btn btn-primary shadow-md shadow-emerald-400/20 flex items-center gap-2"
      >
        Get Started
        <PhCaretRight size="16" weight="bold" />
      </RouterLink>
    </main>

    <!-- Bento Grid Section -->
    <section class="mt-40 mb-32 max-w-6xl mx-auto px-6">
      <div class="text-center mb-16">
        <span
          class="inline-block px-3 py-1 mb-4 text-md font-bold uppercase text-emerald-800 bg-white rounded-full border border-slate-200"
          >Our Features</span
        >
        <h2 class="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">What we offer</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Expenses -->
        <div
          class="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col items-center"
        >
          <div
            class="w-32 h-32 rounded-full border-8 border-slate-50 relative flex items-center justify-center mb-10 mt-4"
          >
            <svg
              class="absolute inset-0 w-full h-full -rotate-90 text-emerald-500"
              viewBox="0 0 36 36"
            >
              <path
                class="text-slate-100"
                stroke-width="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                stroke-dasharray="75, 100"
                stroke-width="3"
                stroke-linecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span class="font-bold text-xl">$876</span>
          </div>
          <div class="w-full mt-auto">
            <p class="font-bold text-lg text-slate-900">Track your Expenses</p>
            <p class="text-xs text-slate-500 mt-2 font-medium">
              Effortlessly track and manage your expenses with coinz.
            </p>
          </div>
        </div>

        <!-- Credit Card -->
        <div
          class="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-end"
        >
          <div
            class="w-full aspect-[1.58] bg-linear-to-tr from-emerald-600 to-emerald-400 rounded-xl p-5 text-white flex flex-col justify-between mb-8 shadow-lg shadow-emerald-500/20"
          >
            <div class="flex justify-between items-start">
              <svg class="w-8 h-8 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M21 4H3C1.895 4 1 4.895 1 6V18C1 19.105 1.895 20 3 20H21C22.105 20 23 19.105 23 18V6C23 4.895 22.105 4 21 4ZM21 18H3V12H21V18ZM21 8H3V6H21V8Z"
                />
              </svg>
            </div>
            <div>
              <p class="font-mono tracking-widest text-lg mb-1 drop-shadow-sm">
                3455 4562 7710 3507
              </p>
              <div
                class="flex justify-between text-[10px] font-medium opacity-80 uppercase tracking-wider"
              >
                <span>John Doe</span>
                <span>02/30</span>
              </div>
            </div>
          </div>
          <div class="w-full mt-auto">
            <p class="font-bold text-lg text-slate-900">Virtual Wallets</p>
            <p class="text-xs text-slate-500 mt-2 font-medium">
              Experience convenience and security with our virtual cards.
            </p>
          </div>
        </div>

        <!-- Goals -->
        <div
          class="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between"
        >
          <div class="space-y-4 mb-6 pt-4">
            <div>
              <div class="flex justify-between text-xs font-bold text-slate-900 mb-2">
                <span>New Laptop</span>
                <span class="text-emerald-800 drop-shadow drop-shadow-emerald-200">80%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="w-[80%] h-full bg-emerald-500 rounded-full"></div>
              </div>
            </div>
            <div
              class="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between mt-4"
            >
              <span class="text-xs font-medium text-slate-900">Save $200</span>
              <div
                class="rounded-full p-1 bg-emerald-100 flex items-center justify-center border border-emerald-500"
              >
                <PhCheck size="12" class="text-primary" weight="bold" />
              </div>
            </div>
          </div>
          <div class="w-full mt-auto">
            <p class="font-bold text-lg text-slate-900">Smash your goals</p>
            <p class="text-xs text-slate-500 mt-2 font-medium">
              Empower yourself to achieve financial success effortlessly.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { PhCaretRight, PhCoins, PhCheck } from '@phosphor-icons/vue'
</script>

<style scoped></style>
