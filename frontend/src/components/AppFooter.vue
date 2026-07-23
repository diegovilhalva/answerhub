<script setup>
import { ref, onMounted } from 'vue';
import { tagsApi } from '../api/endpoints.js';
import api from '../api/client.js';

const tags = ref([]);
const apiStatus = ref('checking');

async function loadTags() {
    try {
        const { data } = await tagsApi.list();
        tags.value = data.slice(0, 6);
    } catch {
        tags.value = [];
    }
}

async function checkHealth() {
    try {
        await api.get('/health', { baseURL: api.defaults.baseURL.replace(/\/api$/, '') });
        apiStatus.value = 'online';
    } catch {
        apiStatus.value = 'offline';
    }
}

onMounted(() => {
    loadTags();
    checkHealth();
});
</script>

<template>
    <footer class="app-footer">
        <div class="container footer-inner">
            <div class="footer-col brand-col">
                <RouterLink to="/" class="brand">
                    <img src="../assets/logo.png" class="logo" alt="AnswerHub" />
                </RouterLink>
                <p class="tagline">A technical Q&amp;A forum built with the MEVN stack.</p>
                <div class="status">
                    <span class="status-dot" :class="apiStatus"></span>
                    API {{ apiStatus }}
                </div>
            </div>

            <div class="footer-col">
                <h4>Browse</h4>
                <RouterLink to="/">All questions</RouterLink>
                <RouterLink to="/?sort=unanswered">Unanswered</RouterLink>
                <RouterLink to="/ask">Ask a question</RouterLink>
            </div>

            <div class="footer-col">
                <h4>Popular tags</h4>
                <RouterLink v-for="t in tags" :key="t._id" :to="{ path: '/', query: { tag: t.name } }" class="tag-link">
                    {{ t.name }}
                </RouterLink>
                <span v-if="!tags.length" class="meta">No tags yet</span>
            </div>

            <div class="footer-col">
                <h4>Project</h4>
                <a href="https://github.com/diegovilhalva/answerhub" target="_blank" rel="noopener noreferrer">GitHub
                    repository</a>
                <span class="meta">MEVN stack</span>
            </div>
        </div>

        <div class="container footer-bottom">
            <span class="meta">© {{ new Date().getFullYear() }} AnswerHub. Built by
                <a href="https://github.com/diegovilhalva" target="_blank">Diego Vilhalva</a>
            </span>
        </div>
    </footer>
</template>

<style scoped>
.app-footer {
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    margin-top: 48px;
}

.footer-inner {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1fr;
    gap: 32px;
    padding: 40px 20px 28px;
}

.footer-col {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.footer-col h4 {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-ink-soft);
    margin: 0 0 4px;
}

.footer-col a,
.tag-link {
    font-size: var(--step--1);
    color: var(--color-ink-soft);
}

.footer-col a:hover,
.tag-link:hover {
    color: var(--color-accent);
}

.brand-col .brand {
    display: inline-flex;
}

.logo {
    height: 32px;
    width: fit-content;
    object-fit: cover;
}

.tagline {
    font-size: var(--step--1);
    color: var(--color-ink-soft);
    margin: 4px 0 2px;
    max-width: 220px;
}

.status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--color-ink-soft);
    text-transform: uppercase;
}

.status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--color-border);
}

.status-dot.online {
    background: var(--color-accent);
}

.status-dot.offline {
    background: var(--color-danger);
}

.status-dot.checking {
    background: var(--color-gold);
}

.footer-bottom {
    border-top: 1px solid var(--color-border);
    padding: 14px 20px;
    text-align: center;
}

@media (max-width: 768px) {
    .footer-inner {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 480px) {
    .footer-inner {
        grid-template-columns: 1fr;
    }
}
</style>