<template>
  <div class="flex flex-col h-full py:0 md:py-5">
    <nav class="flex-1 flex flex-col px-0 md:px-3 gap-6">
      <template v-for="item in navItems" :key="item.label">
        <RouterLink
          v-if="item.to"
          :to="item.to"
          class="flex gap-2 text-base-content/60 hover:text-success"
          active-class="text-success"
          @click="$emit('navigate')"
        >
          <component :is="item.icon" :size="24" />
          <span>{{ item.label }}</span>
        </RouterLink>

        <button
          v-else
          class="hover:text-success cursor-pointer flex gap-2 text-base-content/60"
          @click="
            () => {
              item.action?.()
              $emit('navigate')
            }
          "
          :disabled="isPending"
        >
          <component :is="item.icon" :size="24" />
          <span>{{ item.label }}</span>
        </button>
      </template>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  PhHouse,
  PhWallet,
  //   PhReceipt,
  //   PhPiggyBank,
  PhGear,
  PhSignOut,
  //   PhTag,
} from '@phosphor-icons/vue'
import { useLogout } from '@/api/useAuth'
const { mutate: logout, isPending } = useLogout()

defineEmits(['navigate'])

const navItems = [
  { to: '/app/dashboard', icon: PhHouse, label: 'Dashboard' },
  { to: '/app/wallets', icon: PhWallet, label: 'Wallets' },
  //   { to: '/app/transactions', icon: PhReceipt, label: 'Transactions' },
  { to: '/app/profile', icon: PhGear, label: 'profile' },
  { to: '', icon: PhSignOut, label: 'Logout', action: logout },
]
</script>
