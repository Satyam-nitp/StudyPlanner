const BASE_URL = 'http://localhost:5000/api/auth';

export async function signup({ name, email, password }) {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Signup failed');
  if (data?.token) localStorage.setItem('token', data.token);
  return data;
}

export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Login failed');
  if (data?.token) localStorage.setItem('token', data.token);
  return data;
}

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
}

export function handleUnauthorized() {
  logout();
  // Redirect to login only if not already there
  if (window.location.pathname !== '/auth') {
    window.location.href = '/auth';
  }
}
