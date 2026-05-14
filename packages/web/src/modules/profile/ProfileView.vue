<template>
  <div class="grid grid-cols-4 gap-6 p-4 bg-slate-50">
    <!-- User Details -->
    <div class="col-span-1 flex flex-col gap-2">
      <StateLoading v-if="isLoading" />
      <StateError v-else-if="isError" />
      <StateNull v-else-if="!data" />
      <div v-else>
        <p class="font-semibold text-lg">{{ data.name }}</p>
        <p class="text-sm text-base-content/70">{{ data.email }}</p>
      </div>

      <button name="updateProfile" class="btn btn-primary" @click="showForm = true">
        Update Profile
      </button>
      <RouterLink to="/dashboard" class="btn btn-secondary border">Cancel</RouterLink>
    </div>

    <!-- Forms -->
    <div class="col-span-3">
      <ProfileForm v-if="showForm" ref="formRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useUserQuery } from '@/api/useAuth'
import ProfileForm from './components/ProfileForm.vue'
import { StateError, StateLoading, StateNull } from '@/components/States'

const showForm = ref(false)

const { data, isLoading, isError } = useQuery(computed(() => useUserQuery()))
</script>

<style scoped></style>
