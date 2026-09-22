<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink, useRouter } from "vue-router";

import { useAuth } from "../composables/useAuth";

const router = useRouter();
const { t } = useI18n();
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
    error.value = error_ instanceof Error ? error_.message : t("auth.logInFailed");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="card auth-card">
    <h1>{{ t("nav.login") }}</h1>

    <form @submit.prevent="handleSubmit">
      <label>
        {{ t("auth.email") }}
        <input v-model="email" type="email" placeholder="you@example.com" required />
      </label>

      <label>
        {{ t("auth.password") }}
        <input v-model="password" type="password" :placeholder="t('auth.passwordPlaceholderLogin')" required />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button class="button" type="submit" :disabled="loading">
        {{ loading ? t("auth.loggingIn") : t("nav.login") }}
      </button>
    </form>

    <p class="hint">
      {{ t("auth.noAccount") }} <RouterLink to="/register">{{ t("auth.signUpButton") }}</RouterLink>
    </p>
  </section>
</template>
