<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usersApi } from '../api/endpoints.js';
import { useAuthStore } from '../stores/auth.js';
import QuestionCard from '../components/QuestionCard.vue';

const route = useRoute();
const auth = useAuthStore();

const profile = ref(null);
const questions = ref([]);
const answers = ref([]);
const loading = ref(true);
const error = ref('');

const isOwnProfile = computed(() => auth.user && auth.user._id === route.params.id);

// Edit form state
const editing = ref(false);
const nameInput = ref('');
const bioInput = ref('');
const avatarFile = ref(null);
const avatarPreview = ref('');
const saving = ref(false);
const saveError = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await usersApi.profile(route.params.id);
    profile.value = data.user;
    questions.value = data.questions;
    answers.value = data.answers;
    nameInput.value = data.user.name;
    bioInput.value = data.user.bio || '';
  } catch (e) {
    error.value = e.response?.data?.message || 'User not found';
  } finally {
    loading.value = false;
  }
}

function onFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
}

async function saveProfile() {
  saveError.value = '';
  saving.value = true;
  try {
    const formData = new FormData();
    formData.append('name', nameInput.value);
    formData.append('bio', bioInput.value);
    if (avatarFile.value) formData.append('avatar', avatarFile.value);

    const { data } = await usersApi.updateMe(formData);
    profile.value = data;
    auth.user = data;
    editing.value = false;
    avatarFile.value = null;
  } catch (e) {
    saveError.value = e.response?.data?.message || 'Could not save profile';
  } finally {
    saving.value = false;
  }
}

watch(() => route.params.id, load);
onMounted(load);
</script>

<template>
  <div class="container profile-page">
    <div v-if="loading" class="state-msg">Loading…</div>
    <div v-else-if="error" class="error-banner">{{ error }}</div>

    <template v-else-if="profile">
      <div class="card profile-header">
        <img
          :src="avatarPreview || auth.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (auth.user?.name || 'default')"
          class="avatar" alt="" />
        <div class="info">
          <h1>{{ profile.name }}</h1>
          <p class="meta">reputation: {{ profile.reputation }} · role: {{ profile.role }}</p>
          <p v-if="profile.bio && !editing" class="bio">{{ profile.bio }}

          </p>
          <p>
            member since {{ new Date(profile.createdAt).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            }) }}
          </p>
        </div>
        <button v-if="isOwnProfile && !editing" class="btn btn-secondary" @click="editing = true">
          Edit profile
        </button>
      </div>

      <div v-if="editing" class="card edit-form">
        <p v-if="saveError" class="error-banner">{{ saveError }}</p>
        <div class="field">
          <label for="avatar">Avatar</label>
          <input id="avatar" type="file" accept="image/*" @change="onFileChange" />
        </div>
        <div class="field">
          <label for="name">Name</label>
          <input id="name" v-model="nameInput" type="text" />
        </div>
        <div class="field">
          <label for="bio">Bio</label>
          <textarea id="bio" v-model="bioInput" rows="3" maxlength="300"></textarea>
        </div>
        <div class="actions">
          <button class="btn btn-primary" :disabled="saving" @click="saveProfile">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
          <button class="btn btn-secondary" @click="editing = false">Cancel</button>
        </div>
      </div>

      <div class="activity">
        <div class="col">
          <h2>Questions</h2>
          <div v-if="!questions.length" class="state-msg small">No questions yet.</div>
          <div class="list">
            <QuestionCard v-for="q in questions" :key="q._id" :question="q" />
          </div>
        </div>

        <div class="col">
          <h2>Answers</h2>
          <div v-if="!answers.length" class="state-msg small">No answers yet.</div>
          <div class="list">
            <RouterLink v-for="a in answers" :key="a._id" :to="`/questions/${a.question}`" class="card answer-snippet">
              {{ a.body.slice(0, 140) }}{{ a.body.length > 140 ? '…' : '' }}
            </RouterLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 32px 20px 60px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap; /* permite quebrar em telas pequenas */
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.info {
  flex: 1;
}

.bio {
  margin: 6px 0 0;
  color: var(--color-ink-soft);
}

.edit-form {
  padding: 20px;
  margin-bottom: 24px;
  max-width: 480px;
}

.edit-form textarea {
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  resize: vertical;
}

.actions {
  display: flex;
  gap: 10px;
}

.activity {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.activity h2 {
  font-size: var(--step-1);
  margin-bottom: 12px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.answer-snippet {
  padding: 12px 14px;
  color: var(--color-ink-soft);
  font-size: var(--step--1);
}

.state-msg {
  padding: 40px 0;
  text-align: center;
  color: var(--color-ink-soft);
}

.state-msg.small {
  padding: 10px 0;
  text-align: left;
}

@media (max-width: 640px) {
  .activity {
    grid-template-columns: 1fr;
  }
   
}

</style>
