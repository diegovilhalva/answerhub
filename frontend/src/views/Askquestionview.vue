<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { questionsApi } from '../api/endpoints.js';
import MarkdownEditor from '../components/MarkdownEditor.vue';

const router = useRouter();
const title = ref('');
const body = ref('');
const tagsInput = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  if (!title.value.trim() || !body.value.trim()) {
    error.value = 'Title and body are required';
    return;
  }
  loading.value = true;
  try {
    const { data } = await questionsApi.create({
      title: title.value,
      body: body.value,
      tags: tagsInput.value,
    });
    router.push(`/questions/${data._id}`);
  } catch (e) {
    error.value = e.response?.data?.message || 'Could not create question';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="container ask-page">
    <h1>Ask a question</h1>
    <p v-if="error" class="error-banner">{{ error }}</p>
    <form @submit.prevent="submit">
      <div class="field">
        <label for="title">Title</label>
        <input
          id="title"
          v-model="title"
          type="text"
          placeholder="Be specific — e.g. 'Why does useEffect run twice in React 18?'"
          required
        />
      </div>

      <div class="field">
        <label>Body</label>
        <MarkdownEditor v-model="body" placeholder="Describe your problem. Use ``` for code blocks." :rows="12" />
      </div>

      <div class="field">
        <label for="tags">Tags</label>
        <input id="tags" v-model="tagsInput" type="text" placeholder="comma, separated, tags (max 5)" />
      </div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Posting…' : 'Post question' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.ask-page {
  padding: 32px 20px 60px;
  max-width: 720px;
}

.ask-page h1 {
  margin-bottom: 18px;
}
</style>