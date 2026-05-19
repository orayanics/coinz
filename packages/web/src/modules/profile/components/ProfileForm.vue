<template>
  <div class="card bg-slate-50 space-y-6">
    <h1 class="text-2xl font-bold">Update Profile</h1>
    <div
      v-if="serverError"
      class="error-server relative z-10 alert alert-error shadow-lg"
      role="alert"
    >
      {{ serverError }}
    </div>

    <div
      v-if="serverSuccess"
      class="success-server relative z-10 alert alert-success shadow-lg"
      role="alert"
    >
      {{ serverSuccess }}
    </div>

    <form
      class="space-y-4 relative w-full rounded-xl border border-dashed border-base-content/20 p-8 overflow-hidden group"
      @submit.prevent="onFormSubmit"
    >
      <fieldset class="fieldset">
        <label for="name" class="label form-name">Name</label>
        <input
          id="name"
          class="input w-full"
          v-model="form.name"
          type="text"
          placeholder="Your name"
          autocomplete="username"
        />
        <p v-if="formErrors?.fieldErrors.name" class="text-sm text-error error-name">
          {{ formErrors.fieldErrors.name[0] }}
        </p>
      </fieldset>

      <fieldset class="fieldset">
        <label for="old_password" class="label form-oldpass">Old Password</label>
        <input
          id="old_password"
          class="input w-full"
          v-model="form.old_password"
          type="password"
          placeholder="********"
          autocomplete="current-password"
        />
        <p v-if="formErrors?.fieldErrors.old_password" class="text-sm text-error error-oldpass">
          {{ formErrors.fieldErrors.old_password[0] }}
        </p>
      </fieldset>

      <fieldset class="fieldset">
        <label for="new_password" class="label form-newpass">New Password</label>
        <input
          id="new_password"
          class="input w-full"
          v-model="form.new_password"
          type="password"
          placeholder="********"
          autocomplete="new-password"
        />
        <p v-if="formErrors?.fieldErrors.new_password" class="text-sm text-error error-newpass">
          {{ formErrors.fieldErrors.new_password[0] }}
        </p>
      </fieldset>

      <fieldset class="fieldset">
        <label for="confirm_password" class="label form-confpass">Confirm New Password</label>
        <input
          id="confirm_password"
          class="input w-full"
          v-model="form.confirm_password"
          type="password"
          placeholder="********"
          autocomplete="confirm-password"
        />
        <p
          v-if="formErrors?.fieldErrors.confirm_password"
          class="text-sm text-error error-confpass"
        >
          {{ formErrors.fieldErrors.confirm_password[0] }}
        </p>
      </fieldset>

      <div class="flex justify-end mt-4">
        <button class="btn btn-primary btn-submit" type="submit" :disabled="isPending">Save</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import useProfileForm from '../hooks/useProfileForm'

const { form, onFormSubmit, serverError, serverSuccess, isPending, formErrors } = useProfileForm()

defineExpose({ submit: onFormSubmit })
</script>
