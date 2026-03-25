<template>
  <dialog ref="dialogRef" class="modal" @close="reset">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Update Wallet Item</h3>

      <form class="flex flex-col gap-3" @submit.prevent="onFormSubmit">
        <span v-if="serverError" class="text-error text-sm">{{ serverError }}</span>

        <fieldset class="fieldset">
          <label class="label">Type</label>
          <div class="flex gap-2">
            <button
              type="button"
              class="btn flex-1"
              :class="form.type === 'EXPENSE' ? 'btn-error' : 'btn-ghost'"
              @click="form.type = 'EXPENSE'"
            >
              Expense
            </button>
            <button
              type="button"
              class="btn flex-1"
              :class="form.type === 'INCOME' ? 'btn-success' : 'btn-ghost'"
              @click="form.type = 'INCOME'"
            >
              Income
            </button>
          </div>
        </fieldset>

        <fieldset class="fieldset">
          <label class="label">Amount</label>
          <input
            v-model.number="form.amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="input w-full"
            :class="{ 'input-error': formErrors?.fieldErrors.amount }"
          />
          <p v-if="formErrors?.fieldErrors.amount" class="text-error">
            {{ formErrors.fieldErrors.amount[0] }}
          </p>
        </fieldset>

        <fieldset class="fieldset">
          <label class="label">Note</label>
          <input
            v-model="form.note"
            type="text"
            placeholder="e.g. Bought groceries"
            class="input w-full"
          />
        </fieldset>

        <fieldset class="fieldset">
          <label class="label"
            >Date
            <span class="text-xs text-gray-500">Defaults to current date</span>
          </label>
          <input
            v-model="dateString"
            type="date"
            class="input w-full"
            :class="{ 'input-error': formErrors?.fieldErrors.date }"
          />
          <p v-if="formErrors?.fieldErrors.date" class="text-error">
            {{ formErrors.fieldErrors.date[0] }}
          </p>
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
  item?: TWalletItemUpdate
  walletId?: string
  itemId?: string
}>()

import { computed, ref, watch } from 'vue'
import { useUpdateWalletItem, useUpdateWalletItemForm } from '../hooks/useUpdateWalletItem'
import type { TWalletItemUpdate } from '../schema'

const { isOpen, close } = useUpdateWalletItem()
const dialogRef = ref<HTMLDialogElement>()

// const walletAsUpdate = computed<TWalletItemUpdate>(() => ({
//   note: props.item?.note,
//   amount: props.item?.amount,
//   date: props.item?.date,
//   type: props.item?.type,
// }))
const itemRef = computed(() => props.item)
const walletIdRef = computed(() => props.walletId)
const itemIdRef = computed(() => props.itemId)

const dateString = computed({
  get: () => (form.value.date ? form.value.date.toISOString().split('T')[0] : ''),
  set: (val: string) => {
    form.value.date = val ? new Date(val) : undefined
  },
})

const { form, formErrors, serverError, isPending, onFormSubmit, reset } = useUpdateWalletItemForm({
  item: itemRef,
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

watch(
  () => props.item,
  (newWallet) => {
    if (newWallet) {
      form.value = { ...newWallet }
    }
  },
  { deep: true, immediate: true },
)
</script>
