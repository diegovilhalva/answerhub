<script setup>
import { computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const props = defineProps({
  source: { type: String, default: '' },
});

marked.setOptions({
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
});

const html = computed(() => DOMPurify.sanitize(marked.parse(props.source || '')));
</script>

<template>
  <div class="markdown-body" v-html="html"></div>
</template>

<style scoped>
.markdown-body {
  font-size: var(--step-0);
  color: var(--color-ink);
}

.markdown-body :deep(p) {
  margin: 0 0 12px;
}

.markdown-body :deep(pre) {
  background: #1e1e1e;
  border-radius: var(--radius-md);
  padding: 14px 16px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  margin: 12px 0;
}

.markdown-body :deep(code) {
  font-family: var(--font-mono);
}

.markdown-body :deep(p code) {
  background: var(--color-accent-soft);
  color: var(--color-accent-hover);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.85em;
}

.markdown-body :deep(a) {
  color: var(--color-accent);
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 22px;
}
</style>