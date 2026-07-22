<script setup>
import { ref, watch, onMounted } from 'vue';
import { questionsApi, tagsApi } from '../api/endpoints.js';
import QuestionCard from '../components/QuestionCard.vue';

const questions = ref([]);
const total = ref(0);
const page = ref(1);
const pages = ref(1);
const sort = ref('recent');
const search = ref('');
const activeTag = ref('');
const tags = ref([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const { data } = await questionsApi.list({
      page: page.value,
      sort: sort.value,
      search: search.value || undefined,
      tag: activeTag.value || undefined,
    });
    questions.value = data.questions;
    total.value = data.total;
    pages.value = data.pages;
  } finally {
    loading.value = false;
  }
}

async function loadTags() {
  const { data } = await tagsApi.list();
  tags.value = data.slice(0, 12);
}

function setTag(name) {
  activeTag.value = activeTag.value === name ? '' : name;
  page.value = 1;
}

watch([sort, activeTag], () => load());

let searchTimeout;
watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    load();
  }, 350);
});

onMounted(() => {
  load();
  loadTags();
});
</script>

<template>
  <div class="container home">
    <div class="head">
      <h1>Questions</h1>
      <RouterLink to="/ask" class="btn btn-primary">Ask question</RouterLink>
    </div>

    <div class="toolbar">
      <input v-model="search" type="search" placeholder="Search questions…" class="search-input" />
      <div class="sort-group">
        <button
          v-for="opt in ['recent', 'votes', 'unanswered']"
          :key="opt"
          class="sort-btn"
          :class="{ active: sort === opt }"
          @click="sort = opt"
        >
          {{ opt }}
        </button>
      </div>
    </div>

    <div v-if="tags.length" class="tag-cloud">
      <button
        v-for="t in tags"
        :key="t._id"
        class="tag"
        :class="{ active: activeTag === t.name }"
        @click="setTag(t.name)"
      >
        {{ t.name }} <span class="tag-count">{{ t.questionCount }}</span>
      </button>
    </div>

    <p class="meta result-count">{{ total }} question{{ total === 1 ? '' : 's' }}</p>

    <div v-if="loading" class="state-msg">Loading…</div>
    <div v-else-if="!questions.length" class="state-msg">
      No questions found. Be the first to <RouterLink to="/ask">ask one</RouterLink>.
    </div>
    <div v-else class="list">
      <QuestionCard v-for="q in questions" :key="q._id" :question="q" />
    </div>

    <div v-if="pages > 1" class="pager">
      <button class="btn btn-secondary" :disabled="page <= 1" @click="page--; load()">Prev</button>
      <span class="meta">Page {{ page }} of {{ pages }}</span>
      <button class="btn btn-secondary" :disabled="page >= pages" @click="page++; load()">Next</button>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 32px 20px 60px;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 220px;
  padding: 9px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}

.sort-group {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.sort-btn {
  background: var(--color-surface);
  border: none;
  padding: 9px 14px;
  font-size: var(--step--1);
  text-transform: capitalize;
  color: var(--color-ink-soft);
  border-right: 1px solid var(--color-border);
}

.sort-btn:last-child {
  border-right: none;
}

.sort-btn.active {
  background: var(--color-accent);
  color: #fff;
}

.tag-cloud {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.tag {
  border: none;
  cursor: pointer;
}

.tag.active {
  background: var(--color-accent);
  color: #fff;
}

.tag-count {
  opacity: 0.7;
  margin-left: 4px;
}

.result-count {
  margin: 0 0 12px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.state-msg {
  padding: 40px 0;
  text-align: center;
  color: var(--color-ink-soft);
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 24px;
}
</style>