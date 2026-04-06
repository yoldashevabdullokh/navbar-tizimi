import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const getQueue = () => api.get('/queue');
export const addToQueue = (data) => api.post('/queue', data);
export const updateStatus = (id, status) => api.patch(`/queue/${id}`, { status });
export const approveQueue = (id, assignedDate, assignedTime) => api.patch(`/queue/${id}/approve`, { assignedDate, assignedTime });
export const rejectQueue = (id) => api.patch(`/queue/${id}/reject`);
export const deleteEntry = (id) => api.delete(`/queue/${id}`);

export default api;
