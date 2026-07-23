<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth.js';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';

const auth = useAuthStore();

onMounted(() => {
  if (auth.token) auth.fetchMe();
});
</script>

<template>
  <AppHeader />
  <main class="main">
    <RouterView />
  </main>
  <AppFooter />
</template>

<style scoped>
.main {
  flex: 1;
}
</style>