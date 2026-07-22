import { defineStore } from 'pinia';
import { authApi } from '../api/endpoints.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('answerhub_token') || null,
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isModerator: (state) => ['moderator', 'admin'].includes(state.user?.role),
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    async register(payload) {
      const { data } = await authApi.register(payload);
      this._setSession(data);
    },
    async login(payload) {
      const { data } = await authApi.login(payload);
      this._setSession(data);
    },
    async fetchMe() {
      if (!this.token) return;
      this.loading = true;
      try {
        const { data } = await authApi.me();
        this.user = data;
        console.log(data)
      } catch {
        this.logout();
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('answerhub_token');
    },
    _setSession({ user, token }) {
      this.user = user;
      this.token = token;
      localStorage.setItem('answerhub_token', token);
    },
  },
});