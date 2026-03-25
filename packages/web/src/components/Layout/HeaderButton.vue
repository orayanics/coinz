<template>
  <div></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const routeName = computed(() => route.name)
</script>

<style scoped></style>
