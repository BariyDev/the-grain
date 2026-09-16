const API_URL = "http://localhost:3000";

export interface User {
  createdAt?: string;
  email: string;
  id: string;
  username: string;
}

export interface Post {
  author: null | { id: string; username: string };
  content: string;
  createdAt: string;
  id: string;
  userId: string;
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function getToken(): null | string {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): null | User {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function saveSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = (await response.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!response.ok) {
    const base = data.error ?? `Request failed (${response.status})`;
    throw new Error(data.message ? `${base}: ${data.message}` : base);
  }

  return data;
}

export const api = {
  register: (body: { email: string; password: string; username: string }) =>
    request<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () => request<User>("/api/auth/me"),

  getPosts: () => request<Post[]>("/api/posts"),

  createPost: (content: string) =>
    request<Post>("/api/posts", {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};
