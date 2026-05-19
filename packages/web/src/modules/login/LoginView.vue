<template>
  <div class="h-full flex-1">
    <div class="grid-overlay" />

    <div class="h-full w-full flex flex-col items-center justify-center gap-4">
      <div class="text-center mb-8 space-y-2">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 font-bold text-3xl tracking-tighter hover:scale-105 transition-transform"
        >
          <div class="w-6 h-6 bg-emerald-500 rounded-md"></div>
          coinz
        </RouterLink>
        <p class="text-base-content/60 font-medium text-sm">Access your digital wallet</p>
      </div>

      <!-- Server Error -->
      <div v-if="serverError" class="relative z-10 alert alert-error shadow-lg" role="alert">
        {{ serverError }}
      </div>

      <!-- Virtual Card Form Wrapper -->
      <form
        @submit.prevent="onFormSubmit"
        class="relative w-full max-w-xl rounded-xl bg-linear-to-tr from-emerald-600 to-emerald-400 p-8 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] overflow-hidden group"
      >
        <!-- Card Header: EMV Chip & Contactless -->
        <div class="flex justify-between items-center mb-10 relative z-10">
          <!-- Golden EMV Chip -->
          <div
            class="w-12 h-9 bg-linear-to-br from-yellow-200 to-yellow-500 rounded-[5px] flex items-center justify-center overflow-hidden border border-yellow-300 shadow-sm"
          >
            <div class="w-11 h-8 rounded-[3px] border border-yellow-600/30 flex relative">
              <div class="absolute inset-x-0 top-1/2 h-px bg-yellow-600/20"></div>
              <div class="absolute inset-y-0 left-[30%] w-px bg-yellow-600/20"></div>
              <div class="absolute inset-y-0 right-[30%] w-px bg-yellow-600/20"></div>
            </div>
          </div>

          <!-- Hologram fake overlay circles -->
          <div class="flex pointer-events-none opacity-60">
            <div class="w-10 h-10 rounded-full bg-emerald-300 mix-blend-screen -mr-4"></div>
            <div class="w-10 h-10 rounded-full bg-teal-200 mix-blend-screen"></div>
          </div>
        </div>

        <fieldset class="fieldset gap-0 mb-4">
          <label
            for="email"
            class="text-xs font-bold uppercase tracking-widest text-white drop-shadow-sm"
            >Account ID</label
          >
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="email@example.com"
            autocomplete="email"
            class="font-mono w-full input border-0 border-b bg-transparent rounded-none px-1 py-1.5 text-white focus:outline-none focus:ring-0 focus:border-white transition-colors"
          />
          <div
            v-if="formErrors?.fieldErrors.email"
            class="mt-2 ml-1 flex items-center gap-1.5 bg-red-500/80 backdrop-blur-sm px-2.5 py-1 rounded w-fit border border-red-400/50"
            data-test="error-email"
          >
            <PhWarning size="14" weight="bold" class="text-white" />
            <p class="text-[11px] text-white font-bold tracking-wide">
              {{ formErrors.fieldErrors.email[0] }}
            </p>
          </div>
        </fieldset>

        <fieldset class="fieldset gap-0">
          <label
            for="password"
            class="text-xs font-bold uppercase tracking-widest text-white drop-shadow-sm"
            >Secure Pin</label
          >
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            class="w-full input border-0 border-b bg-transparent rounded-none px-1 py-1.5 text-white focus:outline-none focus:ring-0 focus:border-white transition-colors"
          />
          <div
            v-if="formErrors?.fieldErrors.password"
            class="mt-2 ml-1 flex items-center gap-1.5 bg-red-500/80 backdrop-blur-sm px-2.5 py-1 rounded w-fit border border-red-400/50"
            data-test="error-password"
          >
            <PhWarning size="14" weight="bold" class="text-white" />
            <p class="text-[11px] text-white font-bold tracking-wide">
              {{ formErrors.fieldErrors.password[0] }}
            </p>
          </div>
        </fieldset>

        <button type="submit" :disabled="isPending" class="btn btn-secondary btn-block mt-8">
          Login
        </button>
      </form>

      <div class="mt-10">
        <p class="text-sm text-base-content/60 font-medium">
          New to coinz?
          <RouterLink to="/register" class="link link-primary link-hover font-semibold ml-1"
            >Setup a wallet</RouterLink
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLoginForm } from './useLoginForm'
import { PhWarning } from '@phosphor-icons/vue'
const { form, onFormSubmit, serverError, isPending, formErrors } = useLoginForm()
</script>
