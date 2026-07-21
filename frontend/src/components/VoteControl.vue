<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.js';
import { votesApi } from '../api/endpoints.js';

const props = defineProps({
  targetType: { type: String, required: true }, // 'question' | 'answer'
  targetId: { type: String, required: true },
  votes: { type: Number, required: true },
  isOwner: { type: Boolean, default: false },
});
const emit = defineEmits(['updated']);

const auth = useAuthStore();
const localVotes = ref(props.votes);
const busy = ref(false);
const error = ref('');

async function vote(value) {
  error.value = '';
  if (!auth.isAuthenticated) {
    error.value = 'Log in to vote';
    return;
  }
  if (props.isOwner) {
    error.value = "Can't vote on your own content";
    return;
  }
  busy.value = true;
  try {
    const { data } = await votesApi.cast(props.targetType, props.targetId, value);
    localVotes.value = data.votes;
    emit('updated', data.votes);
  } catch (e) {
    error.value = e.response?.data?.message || 'Vote failed';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="vote-control">
    <button type="button" class="vote-btn" :disabled="busy" title="Upvote" @click="vote(1)">▲</button>
    <span class="count">{{ localVotes }}</span>
    <button type="button" class="vote-btn" :disabled="busy" title="Downvote" @click="vote(-1)">▼</button>
    <p v-if="error" class="vote-error">{{ error }}</p>
  </div>
</template>

<style scoped>
.vote-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 56px;
  text-align: center;
}

.vote-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  width: 32px;
  height: 28px;
  font-size: 0.75rem;
  color: var(--color-ink-soft);
  line-height: 1;
}

.vote-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.count {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: var(--step-1);
}

.vote-error {
  font-size: 0.7rem;
  color: var(--color-danger);
  margin: 2px 0 0;
  max-width: 70px;
}
</style>