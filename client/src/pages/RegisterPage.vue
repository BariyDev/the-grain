<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink, useRouter } from "vue-router";

import { api } from "../api/client";

const router = useRouter();
const { t } = useI18n();

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
    error.value = error_ instanceof Error ? error_.message : t("auth.signUpFailed");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="card auth-card">
    <h1>{{ t("auth.signUpTitle") }}</h1>

    <form @submit.prevent="handleSubmit">
      <label>
        {{ t("auth.email") }}
        <input v-model="email" type="email" placeholder="you@example.com" required />
      </label>

      <label>
        {{ t("auth.username") }}
        <input
          v-model="username"
          type="text"
          :placeholder="t('auth.usernamePlaceholder')"
          minlength="3"
          maxlength="50"
          required
        />
      </label>

      <label>
        {{ t("auth.password") }}
        <input
          v-model="password"
          type="password"
          :placeholder="t('auth.passwordPlaceholder')"
          minlength="6"
          maxlength="100"
          required
        />
      </label>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ t("auth.accountCreated") }}</p>

      <button class="button" type="submit" :disabled="loading">
        {{ loading ? t("auth.sending") : t("auth.signUpButton") }}
      </button>
    </form>

    <p class="hint">
      {{ t("auth.haveAccount") }} <RouterLink to="/login">{{ t("nav.login") }}</RouterLink>
    </p>
  </section>
</template>
