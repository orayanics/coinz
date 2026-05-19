<template>
  <dialog ref="dialogRef" class="modal" aria-label="Add Wallet" @close="handleClose">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Add Wallet</h3>

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
          <label class="label">Initial Balance</label>
          <input
            v-model.number="form.balance"
            type="number"
            step="0.01"
            placeholder="0.00"
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
          <p v-if="formErrors?.fieldErrors.color" class="text-error">
            {{ formErrors.fieldErrors.color[0] }}
          </p>
        </fieldset>

        <div class="modal-action">
          <button type="button" class="btn" @click="close">Cancel</button>
          <button type="submit" class="btn btn-success" :disabled="isPending">Create</button>
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
import { ref, watch } from 'vue'
import { useCreateWallet, useCreateWalletForm } from '../hooks/useCreateWallet'
import { WALLET_COLORS } from '../schema'

const { isOpen, close } = useCreateWallet()
const dialogRef = ref<HTMLDialogElement>()
const { form, formErrors, serverError, isPending, onFormSubmit, reset } = useCreateWalletForm()

const handleClose = () => {
  reset()
  close()
}

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
</script>
