<script setup>
defineProps({
  question: { type: Object, required: true },
});

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
</script>

<template>
  <RouterLink :to="`/questions/${question._id}`" class="q-card card" :class="{ answered: question.answerCount > 0 }">
    <div class="stats">
      <div class="stat">
        <strong>{{ question.votes }}</strong>
        <span>votes</span>
      </div>
      <div class="stat" :class="{ 'stat-answered': question.answerCount > 0 }">
        <strong>{{ question.answerCount }}</strong>
        <span>answers</span>
      </div>
      <div class="stat">
        <strong>{{ question.viewCount }}</strong>
        <span>views</span>
      </div>
    </div>

    <div class="body">
      <h3 class="title">{{ question.title }}</h3>
      <div class="tags">
        <span v-for="t in question.tags" :key="t" class="tag">{{ t }}</span>
      </div>
      <div class="meta">
        asked {{ timeAgo(question.createdAt) }} by {{ question.author?.name }}
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.q-card {
  display: flex;
  gap: 20px;
  padding: 16px 18px;
  color: var(--color-ink);
  position: relative;
  border-left: 3px solid transparent;
}

.q-card:hover {
  text-decoration: none;
  border-left-color: var(--color-accent);
}

.q-card.answered {
  border-left-color: var(--color-accent-soft);
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 64px;
  font-family: var(--font-mono);
}

.stat {
  display: flex;
  flex-direction: column;
  font-size: 0.72rem;
  color: var(--color-ink-soft);
  text-align: center;
}

.stat strong {
  font-size: var(--step-0);
  color: var(--color-ink);
}

.stat-answered strong {
  color: var(--color-accent);
}

.body {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: var(--step-1);
  margin-bottom: 8px;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
</style>