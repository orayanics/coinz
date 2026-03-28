<template>
  <div class="card bg-base-100 p-4">
    <p v-if="serverError" class="text-error mb-2">{{ serverError }}</p>
    <form class="space-y-4" @submit.prevent="onFormSubmit">
      <fieldset class="fieldset">
        <label class="label">Name</label>
        <input
          class="input w-full"
          v-model="form.name"
          type="text"
          placeholder="Your name"
          autocomplete="username"
        />
        <p v-if="formErrors?.fieldErrors.name" class="text-sm text-error">
          {{ formErrors.fieldErrors.name[0] }}
        </p>
      </fieldset>

      <fieldset class="fieldset">
        <label class="label">Old Password</label>
        <input
          class="input w-full"
          v-model="form.old_password"
          type="password"
          placeholder="********"
          autocomplete="current-password"
        />
        <p v-if="formErrors?.fieldErrors.old_password" class="text-sm text-error">
          {{ formErrors.fieldErrors.old_password[0] }}
        </p>
      </fieldset>

      <fieldset class="fieldset">
        <label class="label">New Password</label>
        <input
          class="input w-full"
          v-model="form.new_password"
          type="password"
          placeholder="********"
          autocomplete="new-password"
        />
        <p v-if="formErrors?.fieldErrors.new_password" class="text-sm text-error">
          {{ formErrors.fieldErrors.new_password[0] }}
        </p>
      </fieldset>

      <fieldset class="fieldset">
        <label class="label">Confirm New Password</label>
        <input
          class="input w-full"
          v-model="form.confirm_password"
          type="password"
          placeholder="********"
          autocomplete="new-password"
        />
        <p v-if="formErrors?.fieldErrors.confirm_password" class="text-sm text-error">
          {{ formErrors.fieldErrors.confirm_password[0] }}
        </p>
      </fieldset>

      <div class="flex justify-end">
        <button class="btn btn-primary" type="submit" :disabled="isPending">Save</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import useProfileForm from '../hooks/useProfileForm'

const { form, onFormSubmit, serverError, isPending, formErrors } = useProfileForm()

defineExpose({ submit: onFormSubmit })
</script>
