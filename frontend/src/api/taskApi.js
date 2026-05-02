import api from './axios';

export const createTask = (projectId, data) => api.post(`/projects/${projectId}/tasks`, data);
export const getTasksByProject = (projectId) => api.get(`/projects/${projectId}/tasks`);
export const getTaskById = (id) => api.get(`/tasks/${id}`);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const getMyTasks = () => api.get('/tasks/mine');
