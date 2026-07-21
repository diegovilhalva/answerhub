<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.register({ name: name.value, email: email.value, password: password.value });
    await auth.fetchMe();
    router.push({ name: 'home' });
  } catch (e) {
    error.value = e.response?.data?.message || 'Registration failed';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container auth-page">
    <div class="card auth-card">
      <h1>Create account</h1>
      <p v-if="error" class="error-banner">{{ error }}</p>
      <form @submit.prevent="submit">
        <div class="field">
          <label for="name">Name</label>
          <input id="name" v-model="name" type="text" required />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" minlength="6" required />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Creating…' : 'Sign up' }}
        </button>
      </form>
      <p class="switch">Already have an account? <RouterLink to="/login">Log in</RouterLink></p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.auth-card {
  width: 100%;
  max-width: 380px;
  padding: 28px 26px;
}

.auth-card h1 {
  margin-bottom: 18px;
}

.switch {
  font-size: var(--step--1);
  color: var(--color-ink-soft);
  margin-top: 14px;
}
</style>