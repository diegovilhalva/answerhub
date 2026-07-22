<script setup></script>

<template>
  <div class="container not-found">
    <span class="code">404</span>
    <h1>Question not found in this index</h1>
    <p class="meta">The page you're looking for doesn't exist.</p>
    <RouterLink to="/" class="btn btn-primary">Back to questions</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  padding: 100px 20px;
  text-align: center;
}

.code {
  font-family: var(--font-mono);
  color: var(--color-accent);
  font-size: var(--step--1);
}

.not-found h1 {
  margin: 8px 0 6px;
}

.not-found p {
  margin-bottom: 20px;
}
</style>
