<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

import { api } from "../api/client";

const router = useRouter();

const email = ref("");
const username = ref("");
const password = ref("");
const error = ref("");
const success = ref(false);
const loading = ref(false);

async function handleSubmit(): Promise<void> {
  error.value = "";
  loading.value = true;
  try {
    await api.register({
      email: email.value,
      username: username.value,
      password: password.value,
    });
    success.value = true;
    setTimeout(() => {
      void router.push("/login");
    }, 1200);
  } catch (error_) {
    error.value = error_ instanceof Error ? error_.message : "Failed to sign up";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="card auth-card">
    <h1>Sign up</h1>

    <form @submit.prevent="handleSubmit">
      <label>
        Email
        <input v-model="email" type="email" placeholder="you@example.com" required />
      </label>

      <label>
        Username
        <input v-model="username" type="text" placeholder="3 to 50 characters" minlength="3" maxlength="50" required />
      </label>

      <label>
        Password
        <input
          v-model="password"
          type="password"
          placeholder="at least 6 characters"
          minlength="6"
          maxlength="100"
          required
        />
      </label>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Account created! Redirecting to login…</p>

      <button class="button" type="submit" :disabled="loading">
        {{ loading ? "Sending…" : "Sign up" }}
      </button>
    </form>

    <p class="hint">Already have an account? <RouterLink to="/login">Log in</RouterLink></p>
  </section>
</template>
