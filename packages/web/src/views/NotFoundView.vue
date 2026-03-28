<template>
  <div class="h-screen flex items-center justify-center">
    <div class="flex items-center justify-center p-8">
      <div class="space-y-4">
        <h1 class="text-xl font-semibold">Oops.</h1>
        <p>We couldn't find the page you were looking for.</p>

        <div class="space-x-2">
          <button class="btn" @click="goBack">Go Back</button>
          <button class="btn" @click="goReset">
            {{ $route.path === '/' ? 'Go to Dashboard' : 'Go to Home' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}

const goReset = () => {
  if (router.currentRoute.value.path === '/') {
    router.push('/app/dashboard')
  } else {
    router.push('/')
  }
}
</script>

<style scoped></style>
