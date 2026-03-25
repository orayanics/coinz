<template>
  <main class="h-screen w-screen flex overflow-hidden">
    <aside
      v-if="sidebarOpen"
      class="bg-base-100 p-4 w-20 border-r border-neutral-600 flex flex-col justify-between shrink-0 z-20"
    >
      <div class="flex flex-col items-center gap-4">
        <RouterLink to="/app/dashboard">
          <PhCoins class="btn btn-square p-1 hover:fill-accent" />
        </RouterLink>
        <div class="flex flex-col gap-4">
          <RouterLink
            to="/app/wallets"
            class="tooltip tooltip-right tooltip-accent"
            data-tip="Wallets"
          >
            <PhWallet class="btn btn-square p-2" />
          </RouterLink>
          <RouterLink
            to="/app/settings"
            class="tooltip tooltip-right tooltip-accent"
            data-tip="Profile"
          >
            <PhGear class="btn btn-square p-2" />
          </RouterLink>
        </div>
      </div>

      <button
        class="tooltip tooltip-right tooltip-accent"
        data-tip="Logout"
        type="button"
        @click="logout()"
        :disabled="isPending"
      >
        <PhSignOut class="btn btn-accent btn-square p-2" />
      </button>
    </aside>

    <div class="flex flex-col flex-1 min-w-0">
      <header class="navbar bg-base-200 border-b border-neutral-600">
        <div class="flex justify-between gap-2 mx-2 w-full">
          <div class="flex items-center gap-2">
            <button type="button" class="btn btn-square" @click="toggleSidebar">
              <PhSidebarSimple :size="24" />
            </button>
            <p class="font-medium capitalize">{{ routeName }}</p>
          </div>
        </div>
      </header>

      <div class="flex flex-1 bg-base-200 overflow-hidden">
        <div class="drawer">
          <input id="priv-drawer" type="checkbox" class="drawer-toggle" v-model="drawerOpen" />
          <div class="drawer-content h-full overflow-y-auto p-4 [scrollbar-width:thin]">
            <RouterView v-slot="{ Component }">
              <Transition name="fade" mode="out-in">
                <component :is="Component" />
              </Transition>
            </RouterView>
          </div>
          <div class="drawer-side z-20">
            <label for="priv-drawer" aria-label="close sidebar" class="drawer-overlay" />
            <ul class="menu p-6 bg-base-100 min-h-full w-full flex flex-col gap-6">
              <button type="button" class="cursor-pointer hover:text-accent" @click="toggleSidebar">
                <PhX :size="24" />
              </button>
              <PrivateSidebar @navigate="drawerOpen = false" />
            </ul>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRoute, RouterView, RouterLink } from 'vue-router'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useLogout } from '@/api/useAuth'
import { PhCoins, PhGear, PhSidebarSimple, PhSignOut, PhWallet, PhX } from '@phosphor-icons/vue'
import PrivateSidebar from './PrivateSidebar.vue'

const { mutate: logout, isPending } = useLogout()

const sidebarOpen = ref(true)
const isMobile = ref(false)
const drawerOpen = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) sidebarOpen.value = false
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const toggleSidebar = () => {
  if (isMobile.value) {
    drawerOpen.value = !drawerOpen.value
  } else {
    sidebarOpen.value = !sidebarOpen.value
  }
}

const route = useRoute()
const routeName = computed(() => route.name)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
