import api from './axios';

export const createProject = (data) => api.post('/projects', data);
export const getAllProjects = () => api.get('/projects');
export const getMyProjects = () => api.get('/projects/mine');
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const addMember = (id, data) => api.post(`/projects/${id}/members`, data);
export const removeMember = (id, userId) => api.delete(`/projects/${id}/members/${userId}`);
