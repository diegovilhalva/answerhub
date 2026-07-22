<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const router = useRouter();


const mobileMenuOpen = ref(false);

function toggleMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function closeMenu() {
  mobileMenuOpen.value = false;
}

function handleLogout() {
  auth.logout();
  closeMenu();
  router.push({ name: 'home' });
}
</script>

<template>
  <header class="app-header">
    <div class="container bar">
      <RouterLink to="/" class="brand" @click="closeMenu">
        <img src="../assets/logo.png" class="logo" alt="Logo">
      </RouterLink>

      <!-- Botão do Menu Mobile (Hambúrguer) -->
      <button class="mobile-toggle" @click="toggleMenu" aria-label="Abrir menu">
        <span :class="{ 'open': mobileMenuOpen }"></span>
        <span :class="{ 'open': mobileMenuOpen }"></span>
        <span :class="{ 'open': mobileMenuOpen }"></span>
      </button>

      <!-- Navegação -->
      <nav class="nav" :class="{ 'is-open': mobileMenuOpen }">
        <RouterLink v-if="auth.isModerator" to="/admin" class="nav-link" @click="closeMenu">Admin</RouterLink>
        
        <template v-if="auth.isAuthenticated">
          <RouterLink to="/ask" class="btn btn-primary" @click="closeMenu">Ask question</RouterLink>
          
          <RouterLink :to="`/users/${auth.user?._id}`" class="user-profile-link" @click="closeMenu">
            <img 
              :src="auth.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (auth.user?.name || 'default')" 
              class="user-avatar" 
              alt="Avatar"
            />
            <span class="nav-link">{{ auth.user?.name }}</span>
          </RouterLink>

          <button class="btn btn-secondary" @click="handleLogout">Log out</button>
        </template>
        
        <template v-else>
          <RouterLink to="/login" class="nav-link" @click="closeMenu">Log in</RouterLink>
          <RouterLink to="/register" class="btn btn-primary" @click="closeMenu">Sign up</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
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

.logo {
  width: fit-content;
  height: 40px;
  object-fit: cover;
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


.user-profile-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border);
}


.mobile-toggle {
  display: none;
  background: transparent;
  border: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  padding: 0;
}

.mobile-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--color-ink);
  transition: all 0.3s ease;
}


@media (max-width: 768px) {
  .mobile-toggle {
    display: flex;
  }

  .nav {
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: var(--color-surface);
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
    gap: 16px;
    border-bottom: 1px solid var(--color-border);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transform: translateY(-150%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease-in-out;
  }

  .nav.is-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>