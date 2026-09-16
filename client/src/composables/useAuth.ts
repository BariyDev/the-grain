import { computed, ref } from "vue";

import { api, clearSession, getStoredUser, getToken, saveSession, type User } from "../api/client";

const user = ref<null | User>(getStoredUser());
const token = ref<null | string>(getToken());

const isAuthenticated = computed(() => token.value !== null);

async function login(email: string, password: string): Promise<void> {
  const data = await api.login({ email, password });
  token.value = data.token;
  user.value = data.user;
  saveSession(data.token, data.user);
}

function logout(): void {
  token.value = null;
  user.value = null;
  clearSession();
}

export function useAuth() {
  return { user, token, isAuthenticated, login, logout };
}
