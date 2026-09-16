<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

import { useAuth } from "../composables/useAuth";

const router = useRouter();
const { login } = useAuth();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleSubmit(): Promise<void> {
  error.value = "";
  loading.value = true;
  try {
    await login(email.value, password.value);
    await router.push("/feed");
  } catch (error_) {
    error.value = error_ instanceof Error ? error_.message : "Failed to log in";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="card auth-card">
    <h1>Log in</h1>

    <form @submit.prevent="handleSubmit">
      <label>
        Email
        <input v-model="email" type="email" placeholder="you@example.com" required />
      </label>

      <label>
        Password
        <input v-model="password" type="password" placeholder="your password" required />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button class="button" type="submit" :disabled="loading">
        {{ loading ? "Logging in…" : "Log in" }}
      </button>
    </form>

    <p class="hint">No account? <RouterLink to="/register">Sign up</RouterLink></p>
  </section>
</template>
