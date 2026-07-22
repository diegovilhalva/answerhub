<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { questionsApi } from '../api/endpoints.js';
import { useAuthStore } from '../stores/auth.js';
import MarkdownContent from '../components/MarkdownContent.vue';
import MarkdownEditor from '../components/MarkdownEditor.vue';
import VoteControl from '../components/VoteControl.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const question = ref(null);
const answers = ref([]);
const loading = ref(true);
const error = ref('');

const answerBody = ref('');
const answerError = ref('');
const answerLoading = ref(false);

const isOwner = computed(() => auth.user && question.value && auth.user._id === question.value.author?._id);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await questionsApi.get(route.params.id);
    question.value = data.question;
    answers.value = data.answers;
  } catch (e) {
    error.value = e.response?.data?.message || 'Question not found';
  } finally {
    loading.value = false;
  }
}

async function submitAnswer() {
  answerError.value = '';
  if (!answerBody.value.trim()) {
    answerError.value = 'Answer cannot be empty';
    return;
  }
  answerLoading.value = true;
  try {
    const { data } = await questionsApi.answer(route.params.id, answerBody.value);
    answers.value.push(data);
    question.value.answerCount += 1;
    answerBody.value = '';
  } catch (e) {
    answerError.value = e.response?.data?.message || 'Could not post answer';
  } finally {
    answerLoading.value = false;
  }
}

async function accept(answerId) {
  try {
    await questionsApi.acceptAnswer(route.params.id, answerId);
    answers.value.forEach((a) => (a.isAccepted = a._id === answerId));
  } catch (e) {
    error.value = e.response?.data?.message || 'Could not accept answer';
  }
}

function goEdit() {
  router.push(`/questions/${route.params.id}/edit`);
}

onMounted(load);
</script>

<template>
  <div class="container q-page">
    <div v-if="loading" class="state-msg">Loading…</div>
    <div v-else-if="error" class="error-banner">{{ error }}</div>

    <template v-else-if="question">
      <div class="q-head">
        <h1>{{ question.title }}</h1>
        <button v-if="isOwner" class="btn btn-secondary" @click="goEdit">Edit</button>
      </div>
      <p class="meta q-meta">
        asked by <RouterLink :to="`/users/${question.author?._id}`">{{ question.author?.name }}</RouterLink>
        · {{ question.viewCount }} views
      </p>

      <div class="card q-body">
        <VoteControl
          target-type="question"
          :target-id="question._id"
          :votes="question.votes"
          :is-owner="isOwner"
        />
        <div class="q-content">
          <MarkdownContent :source="question.body" />
          <div class="tags">
            <RouterLink v-for="t in question.tags" :key="t" class="tag" :to="{ path: '/', query: { tag: t } }">
              {{ t }}
            </RouterLink>
          </div>
        </div>
      </div>

      <h2 class="answers-title">{{ answers.length }} Answer{{ answers.length === 1 ? '' : 's' }}</h2>

      <div v-if="!answers.length" class="state-msg small">No answers yet — be the first to help.</div>

      <div class="answers-list">
        <div v-for="a in answers" :key="a._id" class="card answer" :class="{ accepted: a.isAccepted }">
          <VoteControl
            target-type="answer"
            :target-id="a._id"
            :votes="a.votes"
            :is-owner="auth.user && auth.user._id === a.author?._id"
          />
          <div class="q-content">
            <span v-if="a.isAccepted" class="accepted-badge">✓ Accepted</span>
            <MarkdownContent :source="a.body" />
            <p class="meta">
              answered by <RouterLink :to="`/users/${a.author?._id}`">{{ a.author?.name }}</RouterLink>
            </p>
            <button
              v-if="isOwner && !a.isAccepted"
              class="btn btn-secondary accept-btn"
              @click="accept(a._id)"
            >
              Mark as accepted
            </button>
          </div>
        </div>
      </div>

      <div class="card answer-form">
        <h3>Your answer</h3>
        <p v-if="answerError" class="error-banner">{{ answerError }}</p>
        <template v-if="auth.isAuthenticated">
          <MarkdownEditor v-model="answerBody" placeholder="Write your answer in Markdown…" :rows="8" />
          <button class="btn btn-primary" style="margin-top: 12px" :disabled="answerLoading" @click="submitAnswer">
            {{ answerLoading ? 'Posting…' : 'Post answer' }}
          </button>
        </template>
        <p v-else class="meta">
          <RouterLink to="/login">Log in</RouterLink> to answer this question.
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.q-page {
  padding: 32px 20px 60px;
  max-width: 780px;
}

.q-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.q-meta {
  margin: 6px 0 18px;
}

.q-body,
.answer {
  display: flex;
  gap: 20px;
  padding: 20px;
  margin-bottom: 14px;
}

.q-content {
  flex: 1;
  min-width: 0;
}

.tags {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.answers-title {
  margin: 28px 0 14px;
  font-size: var(--step-1);
}

.answer.accepted {
  border-left: 3px solid var(--color-accent);
}

.accepted-badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-accent);
  margin-bottom: 8px;
}

.accept-btn {
  margin-top: 8px;
}

.answer-form {
  padding: 20px;
  margin-top: 24px;
}

.answer-form h3 {
  margin-bottom: 12px;
  font-size: var(--step-1);
}

.state-msg {
  padding: 40px 0;
  text-align: center;
  color: var(--color-ink-soft);
}

.state-msg.small {
  padding: 16px 0;
  text-align: left;
}
</style>
