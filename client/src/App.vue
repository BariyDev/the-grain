<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { RouterLink, RouterView, useRouter } from "vue-router";

import { useAuth } from "./composables/useAuth";
import { setLocale } from "./i18n";

const router = useRouter();
const { t, locale } = useI18n();
const { user, isAuthenticated, logout } = useAuth();

async function handleLogout(): Promise<void> {
  logout();
  await router.push("/feed");
}
</script>

<template>
  <div class="app">
    <header class="navbar">
      <RouterLink to="/feed" class="logo">
        <span class="logo-text">The Grain.</span>
      </RouterLink>

      <nav class="links">
        <template v-if="isAuthenticated">
          <span class="username">{{ user?.username }}</span>
        </template>
        <template v-else>
          <RouterLink to="/login">{{ t("nav.login") }}</RouterLink>
        </template>

        <div class="lang-switch" role="group" :aria-label="t('nav.language')">
          <span class="lang-thumb" :class="{ 'lang-thumb--ru': locale === 'ru' }"></span>
          <button type="button" :class="{ active: locale === 'en' }" @click="setLocale('en')">EN</button>
          <button type="button" :class="{ active: locale === 'ru' }" @click="setLocale('ru')">RU</button>
        </div>

        <template v-if="isAuthenticated">
          <button
            class="icon-button"
            type="button"
            :aria-label="t('nav.logout')"
            :title="t('nav.logout')"
            @click="handleLogout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </button>
        </template>
      </nav>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>
