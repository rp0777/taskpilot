import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export interface Board {
  id: string;
  title: string;
  description?: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  boardId: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  order: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  label?: string;
  dueDate?: string;
  columnId: string;
}

// Board API
export const getBoards = () => api.get<Board[]>('/boards').then(r => r.data);
export const getBoard = (id: string) => api.get<Board>(`/boards/${id}`).then(r => r.data);
export const createBoard = (data: { title: string; description?: string }) => api.post<Board>('/boards', data).then(r => r.data);
export const deleteBoard = (id: string) => api.delete(`/boards/${id}`);

// Column API
export const createColumn = (data: { title: string; order: number; boardId: string }) => api.post<Column>('/columns', data).then(r => r.data);
export const updateColumn = (id: string, data: Partial<Column>) => api.patch<Column>(`/columns/${id}`, data).then(r => r.data);
export const deleteColumn = (id: string) => api.delete(`/columns/${id}`);

// Task API
export const createTask = (data: { title: string; description?: string; order: number; priority?: string; label?: string; columnId: string }) => api.post<Task>('/tasks', data).then(r => r.data);
export const updateTask = (id: string, data: Partial<Task>) => api.patch<Task>(`/tasks/${id}`, data).then(r => r.data);
export const moveTask = (id: string, data: { columnId: string; order: number }) => api.patch<Task>(`/tasks/${id}/move`, data).then(r => r.data);
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);

export default api;
