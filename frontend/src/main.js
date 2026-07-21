// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// 1. Crie a instância do Pinia
const pinia = createPinia()

// 2. Registre o Pinia ANTES do router ou de montar o app
app.use(pinia) 
app.use(router)

app.mount('#app')