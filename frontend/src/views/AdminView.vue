<script setup>
import { ref, onMounted } from 'vue';
import { adminApi, questionsApi } from '../api/endpoints.js';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const stats = ref(null);
const users = ref([]);
const search = ref('');
const questions = ref([]);
const questionSearch = ref('');
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

async function loadQuestions() {
  const { data } = await questionsApi.list({
    search: questionSearch.value || undefined,
    limit: 20,
  });
  questions.value = data.questions;
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

async function removeQuestion(question) {
  if (!confirm(`Delete question "${question.title}"? This also deletes its answers.`)) return;
  try {
    await adminApi.deleteQuestion(question._id);
    questions.value = questions.value.filter((q) => q._id !== question._id);
    if (stats.value) stats.value.questions -= 1;
  } catch (e) {
    error.value = e.response?.data?.message || 'Could not delete question';
  }
}

let searchTimeout;
function onSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadUsers, 300);
}

let questionSearchTimeout;
function onQuestionSearchInput() {
  clearTimeout(questionSearchTimeout);
  questionSearchTimeout = setTimeout(loadQuestions, 300);
}

onMounted(async () => {
  loading.value = true;
  await loadStats();
  await loadQuestions();
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

    <h2 class="section-title">Questions</h2>
    <input v-model="questionSearch" type="search" placeholder="Search questions…" class="search-input"
      @input="onQuestionSearchInput" />

    <!-- Wrapper adicionado aqui para responsividade -->
    <div class="table-responsive" v-if="questions.length">
      <table class="user-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Answers</th>
            <th>Votes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in questions" :key="q._id">
            <td>
              <RouterLink :to="`/questions/${q._id}`">{{ q.title }}</RouterLink>
            </td>
            <td class="meta">{{ q.author?.name }}</td>
            <td class="meta">{{ q.answerCount }}</td>
            <td class="meta">{{ q.votes }}</td>
            <td>
              <button class="btn btn-danger" @click="removeQuestion(q)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="!loading" class="state-msg small">No questions found.</p>

    <template v-if="auth.isAdmin">
      <h2 class="section-title">Users</h2>
      <input v-model="search" type="search" placeholder="Search by name or email…" class="search-input"
        @input="onSearchInput" />

      <!-- Wrapper adicionado aqui para responsividade -->
      <div class="table-responsive" v-if="users.length">
        <table class="user-table">
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
      </div>
      <p v-else-if="!loading" class="state-msg small">No users found.</p>
    </template>
    <p v-else class="meta">User management is admin-only.</p>
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


.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
  
}

.user-table th,
.user-table td {
  text-align: left;
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--step--1);
}


.user-table tr:last-child td {
  border-bottom: none;
}

.user-table th {
  background: var(--color-bg);
  font-family: var(--font-mono);
  text-transform: uppercase;
  font-size: 0.7rem;
  color: var(--color-ink-soft);
  white-space: nowrap;
  /* Evita que o cabeçalho quebre em duas linhas */
}

.state-msg.small {
  color: var(--color-ink-soft);
}

/* Ajustes para Responsividade */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .search-input {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .admin-page {
    padding: 20px 16px 40px;
   
  }

  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>