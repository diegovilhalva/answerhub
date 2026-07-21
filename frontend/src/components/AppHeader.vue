<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const router = useRouter();

function handleLogout() {
  auth.logout();
  router.push({ name: 'home' });
}
</script>

<template>
  <header class="app-header">
    <div class="container bar">
      <RouterLink to="/" class="brand">
        <span class="brand-mark">▣</span>
        AnswerHub
      </RouterLink>

      <nav class="nav">
        <RouterLink v-if="auth.isModerator" to="/admin" class="nav-link">Admin</RouterLink>
        <template v-if="auth.isAuthenticated">
          <RouterLink to="/ask" class="btn btn-primary">Ask question</RouterLink>
          <RouterLink :to="`/users/${auth.user?._id}`" class="nav-link">
            {{ auth.user?.name }}
          </RouterLink>
          <button class="btn btn-secondary" @click="handleLogout">Log out</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="nav-link">Log in</RouterLink>
          <RouterLink to="/register" class="btn btn-primary">Sign up</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--step-1);
  color: var(--color-ink);
}

.brand:hover {
  text-decoration: none;
}

.brand-mark {
  color: var(--color-accent);
}

.nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  font-size: var(--step--1);
  font-weight: 600;
  color: var(--color-ink-soft);
}

.nav-link:hover {
  color: var(--color-accent);
  text-decoration: none;
}
</style>