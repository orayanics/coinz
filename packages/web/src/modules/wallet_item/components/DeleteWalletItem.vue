<template>
  <dialog ref="dialogRef" class="modal" aria-label="Delete Wallet Item" @close="close">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Delete Wallet Item</h3>
      <div class="alert alert-error alert-soft">
        Are you sure to delete this wallet item? This will recompute the wallet's balance.
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
  walletId?: string
  itemId?: string
}>()

import { computed, ref, watch } from 'vue'
import { useDeleteWalletItem, useDeleteWalletItemForm } from '../hooks/useDeleteWalletItem'

const { isOpen, close } = useDeleteWalletItem()
const dialogRef = ref<HTMLDialogElement>()

const walletIdRef = computed(() => props.walletId)
const itemIdRef = computed(() => props.itemId)

const { isLoading, serverError, onFormSubmit } = useDeleteWalletItemForm({
  walletId: walletIdRef,
  itemId: itemIdRef,
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
</script>
