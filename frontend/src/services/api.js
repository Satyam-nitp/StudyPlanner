const BASE_URL = 'http://localhost:5000/api';
import { handleUnauthorized } from './auth';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getSubjects = async () => {
  const res = await fetch(`${BASE_URL}/subjects`, {
    headers: { ...authHeaders() },
  });
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error('Failed to load subjects');
  return res.json();
};

export const toggleLectureDone = async (subjectId, chapterId, lectureId) => {
  const res = await fetch(`${BASE_URL}/subjects/${subjectId}/chapters/${chapterId}/lectures/${lectureId}`, {
    method: 'PATCH',
    headers: { ...authHeaders() },
  });
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error('Failed to toggle lecture');
};
