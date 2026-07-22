<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { questionsApi } from '../api/endpoints.js';
import MarkdownEditor from '../components/MarkdownEditor.vue';

const route = useRoute();
const router = useRouter();

const title = ref('');
const body = ref('');
const tagsInput = ref('');
const loading = ref(true);
const saving = ref(false);
const error = ref('');

async function load() {
  loading.value = true;
  try {
    const { data } = await questionsApi.get(route.params.id);
    title.value = data.question.title;
    body.value = data.question.body;
    tagsInput.value = (data.question.tags || []).join(', ');
  } catch (e) {
    error.value = e.response?.data?.message || 'Could not load question';
  } finally {
    loading.value = false;
  }
}

async function submit() {
  error.value = '';
  saving.value = true;
  try {
    await questionsApi.edit(route.params.id, {
      title: title.value,
      body: body.value,
      tags: tagsInput.value,
    });
    router.push(`/questions/${route.params.id}`);
  } catch (e) {
    error.value = e.response?.data?.message || 'Could not save changes';
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="container edit-page">
    <h1>Edit question</h1>
    <div v-if="loading" class="state-msg">Loading…</div>
    <template v-else>
      <p v-if="error" class="error-banner">{{ error }}</p>
      <form @submit.prevent="submit">
        <div class="field">
          <label for="title">Title</label>
          <input id="title" v-model="title" type="text" required />
        </div>
        <div class="field">
          <label>Body</label>
          <MarkdownEditor v-model="body" :rows="12" />
        </div>
        <div class="field">
          <label for="tags">Tags</label>
          <input id="tags" v-model="tagsInput" type="text" placeholder="comma, separated, tags" />
        </div>
        <div class="actions">
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
          <RouterLink :to="`/questions/${route.params.id}`" class="btn btn-secondary">Cancel</RouterLink>
        </div>
      </form>
    </template>
  </div>
</template>

<style scoped>
.edit-page {
  padding: 32px 20px 60px;
  max-width: 720px;
}

.edit-page h1 {
  margin-bottom: 18px;
}

.actions {
  display: flex;
  gap: 10px;
}

.state-msg {
  padding: 40px 0;
  text-align: center;
  color: var(--color-ink-soft);
}
</style>
