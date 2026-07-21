<script setup>
import { ref } from 'vue';
import MarkdownContent from './MarkdownContent.vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Write in Markdown…' },
  rows: { type: Number, default: 10 },
});
const emit = defineEmits(['update:modelValue']);

const mode = ref('write');
</script>

<template>
  <div class="editor card">
    <div class="editor-tabs">
      <button
        type="button"
        class="tab"
        :class="{ active: mode === 'write' }"
        @click="mode = 'write'"
      >
        Write
      </button>
      <button
        type="button"
        class="tab"
        :class="{ active: mode === 'preview' }"
        @click="mode = 'preview'"
      >
        Preview
      </button>
    </div>

    <textarea
      v-if="mode === 'write'"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <div v-else class="preview-pane">
      <MarkdownContent v-if="modelValue" :source="modelValue" />
      <p v-else class="empty">Nothing to preview yet.</p>
    </div>
  </div>
</template>

<style scoped>
.editor {
  overflow: hidden;
}

.editor-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}

.tab {
  border: none;
  background: transparent;
  padding: 8px 16px;
  font-size: var(--step--1);
  font-weight: 600;
  color: var(--color-ink-soft);
  border-bottom: 2px solid transparent;
}

.tab.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

textarea {
  width: 100%;
  border: none;
  padding: 14px;
  resize: vertical;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--color-ink);
  background: transparent;
}

textarea:focus {
  outline: none;
}

.preview-pane {
  padding: 14px;
  min-height: 120px;
}

.empty {
  color: var(--color-ink-soft);
  font-style: italic;
  margin: 0;
}
</style>