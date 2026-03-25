<template>
  <dialog ref="dialogRef" class="modal" @close="reset">
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
            step="0.01"
            placeholder="0.00"
            min="0"
            class="input w-full"
            :class="{ 'input-error': formErrors?.fieldErrors.balance }"
          />
          <p v-if="formErrors?.fieldErrors.balance" class="text-error">
            {{ formErrors.fieldErrors.balance[0] }}
          </p>
        </fieldset>

        <fieldset class="fieldset">
          <label class="label"
            >Color <span class="text-xs text-gray-500">Defaults to current color</span></label
          >
          <div class="flex items-center gap-3">
            <input v-model="form.color" type="color" class="w-10 h-10 rounded cursor-pointer" />
            <span class="text-sm text-gray-500">Pick a color for your wallet</span>
          </div>
        </fieldset>

        <fieldset class="fieldset">
          <label class="label">Hide Wallet</label>
          <input type="checkbox" v-model="form.is_archived" class="toggle" />
        </fieldset>

        <div class="modal-action">
          <button type="button" class="btn" @click="close">Cancel</button>
          <button type="submit" class="btn btn-accent" :disabled="isPending">Update</button>
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

import { ref, watch } from 'vue'
import { useUpdateWallet, useUpdateWalletForm } from '../hooks/useUpdateWallet'
import type { TWalletUpdate } from '../schema'

const { isOpen, close } = useUpdateWallet()
const dialogRef = ref<HTMLDialogElement>()
const { form, formErrors, serverError, isPending, onFormSubmit, reset } = useUpdateWalletForm({
  wallet: props.wallet,
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
