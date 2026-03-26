<template>
  <dialog ref="dialogRef" class="modal" @close="close">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Delete Wallet</h3>

      <div class="alert alert-error alert-soft">
        Are you sure to delete this wallet? All transactions in this wallet will be deleted.
      </div>

      <span v-if="serverError" class="text-error text-sm">{{ serverError }}</span>

      <div class="flex justify-end gap-2 mt-6">
        <button type="button" class="btn btn-ghost" :disabled="isLoading" @click="close">
          Cancel
        </button>
        <button type="submit" class="btn btn-error" :disabled="isLoading" @click="onFormSubmit">
          <span v-if="isLoading" class="loading loading-spinner loading-sm" />
          Delete
        </button>
      </div>
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
  walletId: string
}>()

import { ref, watch } from 'vue'
import { useDeleteWallet, useDeleteWalletForm } from '../hooks/useDeleteWallet'

const { isOpen, close } = useDeleteWallet()
const dialogRef = ref<HTMLDialogElement>()
const { isLoading, serverError, onFormSubmit } = useDeleteWalletForm(props.walletId)

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
