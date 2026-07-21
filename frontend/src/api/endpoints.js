import api from './client.js';

export const questionsApi = {
  list(params) {
    return api.get('/questions', { params });
  },
  get(id) {
    return api.get(`/questions/${id}`);
  },
  create(payload) {
    return api.post('/questions', payload);
  },
  edit(id, payload) {
    return api.patch(`/questions/${id}/edit`, payload);
  },
  answer(id, body) {
    return api.post(`/questions/${id}/answers`, { body });
  },
  acceptAnswer(questionId, answerId) {
    return api.patch(`/questions/${questionId}/accept/${answerId}`);
  },
};

export const votesApi = {
  cast(targetType, targetId, value) {
    return api.post('/votes', { targetType, targetId, value });
  },
};

export const tagsApi = {
  list() {
    return api.get('/tags');
  },
};

export const usersApi = {
  profile(id) {
    return api.get(`/users/${id}`);
  },
  updateMe(formData) {
    return api.patch('/users/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const authApi = {
  register(payload) {
    return api.post('/auth/register', payload);
  },
  login(payload) {
    return api.post('/auth/login', payload);
  },
  me() {
    return api.get('/auth/me');
  },
};

export const adminApi = {
  listUsers(params) {
    return api.get('/admin/users', { params });
  },
  updateUserRole(id, role) {
    return api.patch(`/admin/users/${id}/role`, { role });
  },
  deleteUser(id) {
    return api.delete(`/admin/users/${id}`);
  },
  deleteQuestion(id) {
    return api.delete(`/admin/questions/${id}`);
  },
  deleteAnswer(id) {
    return api.delete(`/admin/answers/${id}`);
  },
  stats() {
    return api.get('/admin/stats');
  },
};