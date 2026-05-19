<template>
  <dialog ref="dialogRef" class="modal" aria-label="Update Wallet" @close="reset">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Update Wallet</h3>

      <form class="flex flex-col gap-3" @submit.prevent="onFormSubmit">
        <span v-if="serverError" class="text-error text-sm">{{ serverError }}</span>

        <fieldset class="fieldset">
          <label class="label">
            Name <span class="text-xs text-gray-500">Must be unique</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. Daily Expenses"
            class="input w-full"
            :class="{ 'input-error': formErrors?.fieldErrors.name }"
          />
          <p v-if="formErrors?.fieldErrors.name" class="text-error">
            {{ formErrors.fieldErrors.name[0] }}
          </p>
        </fieldset>

        <fieldset class="fieldset">
          <label class="label"
            >Balance
            <span class="text-xs text-gray-500"
              >An adjustment item will be created upon update</span
            >
          </label>
          <input
            v-model.number="form.balance"
            type="number"
            placeholder="0.00"
            step="0.01"
            class="input w-full"
            :class="{ 'input-error': formErrors?.fieldErrors.balance }"
          />
          <p v-if="formErrors?.fieldErrors.balance" class="text-error">
            {{ formErrors.fieldErrors.balance[0] }}
          </p>
        </fieldset>

        <fieldset class="fieldset">
          <label class="label">
            Color <span class="text-xs text-gray-500">Choose from allowed colors</span>
          </label>
          <div class="flex flex-col lg:flex-row items-center gap-3">
            <div class="grid grid-cols-5 gap-2">
              <button
                type="button"
                v-for="color in WALLET_COLORS"
                :key="color"
                :style="{ backgroundColor: color }"
                class="w-10 h-10 rounded border-2 border-gray-200"
                :class="{ 'ring-2 ring-offset-1 ring-black': form.color === color }"
                @click="form.color = color"
              ></button>
            </div>
            <p class="text-sm text-gray-500">Pick a color for your wallet</p>
          </div>
        </fieldset>

        <fieldset class="fieldset">
          <label class="label"
            >Hide Wallet
            <span class="text-xs text-gray-500"
              >Hidden wallets will be excluded from any computations.</span
            >
          </label>
          <div class="flex gap-2 items-center">
            <input type="checkbox" v-model="form.is_archived" class="toggle" />
            <PhEye v-if="form.is_archived" size="24" class="text-gray-400" />
            <PhEyeSlash v-else size="24" class="text-gray-400" />
          </div>
        </fieldset>

        <div class="modal-action">
          <button type="button" class="btn" @click="close">Cancel</button>
          <button type="submit" class="btn btn-success" :disabled="isPending">Update</button>
        </div>
      </form>
    </div>
    <div
      :class="[
        'modal-backdrop transition-[backdrop-filter] duration-150',
        isOpen ? 'backdrop-blur-[2px]' : 'backdrop-blur-0',
      ]"
      @click="close"
    />
  </dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  wallet: TWalletUpdate
  walletId: string
}>()

import { computed, ref, watch } from 'vue'
import { useUpdateWallet, useUpdateWalletForm } from '../hooks/useUpdateWallet'
import type { TWalletUpdate } from '../schema'
import { PhEye, PhEyeSlash } from '@phosphor-icons/vue'
import { WALLET_COLORS } from '../schema'

const { isOpen, close } = useUpdateWallet()
const dialogRef = ref<HTMLDialogElement>()

const walletAsUpdate = computed<TWalletUpdate>(() => ({
  name: props.wallet.name,
  balance: props.wallet.balance,
  color: props.wallet.color,
  is_archived: props.wallet.is_archived,
}))

const { form, formErrors, serverError, isPending, onFormSubmit, reset } = useUpdateWalletForm({
  wallet: walletAsUpdate,
  walletId: props.walletId,
})

watch(
  isOpen,
  (val) => {
    const dialog = dialogRef.value
    if (!dialog) return

    if (val && !dialog.open) dialog.showModal()
    if (!val && dialog.open) dialog.close()
  },
  { immediate: true },
)

watch(
  () => props.wallet,
  (newWallet) => {
    if (newWallet) {
      form.value = { ...newWallet }
    }
  },
  { deep: true, immediate: true },
)
</script>
