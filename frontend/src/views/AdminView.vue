<script setup>
import { ref, onMounted } from 'vue';
import { adminApi } from '../api/endpoints.js';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const stats = ref(null);
const users = ref([]);
const search = ref('');
const loading = ref(true);
const error = ref('');

async function loadStats() {
  try {
    const { data } = await adminApi.stats();
    stats.value = data;
  } catch (e) {
    error.value = e.response?.data?.message || 'Could not load stats';
  }
}

async function loadUsers() {
  const { data } = await adminApi.listUsers({ search: search.value || undefined });
  users.value = data.users;
}

async function changeRole(user, role) {
  try {
    const { data } = await adminApi.updateUserRole(user._id, role);
    Object.assign(user, data);
  } catch (e) {
    error.value = e.response?.data?.message || 'Could not update role';
  }
}

async function removeUser(user) {
  if (!confirm(`Delete user ${user.name}? This cannot be undone.`)) return;
  try {
    await adminApi.deleteUser(user._id);
    users.value = users.value.filter((u) => u._id !== user._id);
  } catch (e) {
    error.value = e.response?.data?.message || 'Could not delete user';
  }
}

let searchTimeout;
function onSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadUsers, 300);
}

onMounted(async () => {
  loading.value = true;
  await loadStats();
  if (auth.isAdmin) await loadUsers();
  loading.value = false;
});
</script>

<template>
  <div class="container admin-page">
    <h1>Admin</h1>
    <p v-if="error" class="error-banner">{{ error }}</p>

    <div v-if="stats" class="stats-grid">
      <div class="stat-card card">
        <strong>{{ stats.users }}</strong>
        <span>users</span>
      </div>
      <div class="stat-card card">
        <strong>{{ stats.questions }}</strong>
        <span>questions</span>
      </div>
      <div class="stat-card card">
        <strong>{{ stats.answers }}</strong>
        <span>answers</span>
      </div>
      <div class="stat-card card">
        <strong>{{ stats.unansweredQuestions }}</strong>
        <span>unanswered</span>
      </div>
    </div>

    <div v-if="stats?.topTags?.length" class="top-tags">
      <h2>Top tags</h2>
      <div class="tag-list">
        <span v-for="t in stats.topTags" :key="t._id" class="tag">
          {{ t.name }} <span class="count">{{ t.questionCount }}</span>
        </span>
      </div>
    </div>

    <template v-if="auth.isAdmin">
      <h2 class="section-title">Users</h2>
      <input
        v-model="search"
        type="search"
        placeholder="Search by name or email…"
        class="search-input"
        @input="onSearchInput"
      />

      <table v-if="users.length" class="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Reputation</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u._id">
            <td>{{ u.name }}</td>
            <td class="meta">{{ u.email }}</td>
            <td>
              <select :value="u.role" @change="changeRole(u, $event.target.value)">
                <option value="user">user</option>
                <option value="moderator">moderator</option>
                <option value="admin">admin</option>
              </select>
            </td>
            <td class="meta">{{ u.reputation }}</td>
            <td>
              <button class="btn btn-danger" @click="removeUser(u)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else-if="!loading" class="state-msg small">No users found.</p>
    </template>
    <p v-else class="meta">Moderators can view stats. User management is admin-only.</p>
  </div>
</template>

<style scoped>
.admin-page {
  padding: 32px 20px 60px;
}

.admin-page h1 {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 26px;
}

.stat-card {
  padding: 16px;
  text-align: center;
}

.stat-card strong {
  display: block;
  font-family: var(--font-mono);
  font-size: var(--step-3);
  color: var(--color-accent);
}

.stat-card span {
  font-size: var(--step--1);
  color: var(--color-ink-soft);
}

.top-tags {
  margin-bottom: 26px;
}

.top-tags h2,
.section-title {
  font-size: var(--step-1);
  margin-bottom: 10px;
}

.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.count {
  opacity: 0.7;
  margin-left: 4px;
}

.search-input {
  width: 100%;
  max-width: 320px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  margin-bottom: 14px;
  display: block;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.user-table th,
.user-table td {
  text-align: left;
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--step--1);
}

.user-table th {
  background: var(--color-bg);
  font-family: var(--font-mono);
  text-transform: uppercase;
  font-size: 0.7rem;
  color: var(--color-ink-soft);
}

.state-msg.small {
  color: var(--color-ink-soft);
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
