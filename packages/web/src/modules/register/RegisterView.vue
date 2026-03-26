<template>
  <div class="bg-base-100 flex-1 flex flex-col justify-center items-center">
    <p v-if="serverError">{{ serverError }}</p>

    <div>
      <form class="card-body" @submit.prevent="onFormSubmit">
        <fieldset class="fieldset">
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
        </fieldset>

        <fieldset class="fieldset">
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
        </fieldset>

        <fieldset class="fieldset">
          <label for="password">Password</label>
          <input
            class="input"
            id="password"
            v-model="form.password"
            type="password"
            placeholder="********"
          />
          <span v-if="formErrors?.fieldErrors.password">
            {{ formErrors.fieldErrors.password[0] }}
          </span>
        </fieldset>

        <button class="btn btn-success" type="submit" :disabled="isPending">Register</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegisterForm } from './useRegisterForm'

const { form, onFormSubmit, serverError, isPending, formErrors } = useRegisterForm()
</script>
