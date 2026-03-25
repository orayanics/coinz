<template>
  <div>
    <h1>Register Form</h1>

    <p v-if="serverError">{{ serverError }}</p>

    <form @submit.prevent="onFormSubmit">
      <div>
        <label for="name">Name</label>
        <input
          class="input"
          id="name"
          v-model="form.name"
          type="text"
          placeholder="Juan dela Cruz"
        />
        <span v-if="formErrors?.fieldErrors.name">
          {{ formErrors.fieldErrors.name[0] }}
        </span>
      </div>

      <div>
        <label for="email">Email</label>
        <input
          class="input"
          id="email"
          v-model="form.email"
          type="email"
          placeholder="juan@example.com"
        />
        <span v-if="formErrors?.fieldErrors.email">
          {{ formErrors.fieldErrors.email[0] }}
        </span>
      </div>

      <div>
        <label for="password">Password</label>
        <input class="input" id="password" v-model="form.password" type="password" />
        <span v-if="formErrors?.fieldErrors.password">
          {{ formErrors.fieldErrors.password[0] }}
        </span>
      </div>

      <button class="btn" type="submit" :disabled="isPending">
        {{ isPending ? 'Registering...' : 'Register' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useRegisterForm } from './useRegisterForm'

const { form, onFormSubmit, serverError, isPending, formErrors } = useRegisterForm()
</script>
