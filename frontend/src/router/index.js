import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Homeview.vue') },
  { path: '/login', name: 'login', component: () => import('../views/Loginview.vue') },
  { path: '/register', name: 'register', component: () => import('../views/Registerview.vue') },
  /*{
    path: '/ask',
    name: 'ask',
    component: () => import('../views/AskQuestionview.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/questions/:id',
    name: 'question-detail',
    component: () => import('../views/QuestionDetailView.vue'),
  },
  {
    path: '/questions/:id/edit',
    name: 'question-edit',
    component: () => import('../views/EditQuestionView.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/users/:id', name: 'profile', component: () => import('../views/ProfileView.vue') },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, requiresModerator: true },
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },*/
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.requiresModerator && !auth.isModerator) {
    return { name: 'home' };
  }
  return true;
});

export default router;