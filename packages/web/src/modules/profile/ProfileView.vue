<template>
  <div class="grid grid-cols-4 gap-4 p-4">
    <!-- User Details -->
    <div class="col-span-1 flex flex-col gap-2">
      <StateLoading v-if="isLoading" />
      <StateError v-else-if="isError" />
      <StateNull v-else-if="!data" />
      <div v-else class="bg-base-100">
        <p class="font-semibold text-lg">{{ data.name }}</p>
        <p class="text-sm text-base-content/70">{{ data.email }}</p>
      </div>

      <button class="btn" @click="showForm = true">Update Profile</button>
      <button class="btn btn-ghost" @click="onCancel">Cancel</button>
    </div>

    <!-- Forms -->
    <div class="col-span-3">
      <ProfileForm v-if="showForm" ref="formRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { useUserQuery } from '@/api/useAuth'
import ProfileForm from './components/ProfileForm.vue'
import { StateError, StateLoading, StateNull } from '@/components/States'

const router = useRouter()
const showForm = ref(false)

const { data, isLoading, isError } = useQuery(computed(() => useUserQuery()))

function onCancel() {
  router.push('/dashboard')
}
</script>

<style scoped></style>
