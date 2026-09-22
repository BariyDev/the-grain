<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";

import { api, type Post } from "../api/client";
import PostCard from "../components/PostCard.vue";
import { useAuth } from "../composables/useAuth";

const { isAuthenticated } = useAuth();
const { t, d } = useI18n();

const posts = ref<Post[]>([]);
const content = ref("");
const error = ref("");
const loading = ref(true);
const sending = ref(false);

interface PostGroup {
  key: string;
  label: string;
  posts: Post[];
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDay(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return t("feed.today");
  if (isSameDay(date, yesterday)) return t("feed.yesterday");
  return d(date, "long");
}

const groupedPosts = computed<PostGroup[]>(() => {
  const groups: PostGroup[] = [];
  for (const post of posts.value) {
    const date = new Date(post.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    let group = groups.at(-1);
    if (!group || group.key !== key) {
      group = { key, label: formatDay(date), posts: [] };
      groups.push(group);
    }
    group.posts.push(post);
  }
  return groups;
});

const postsCountLabel = computed(() => t("feed.posts", posts.value.length));

async function loadPosts(): Promise<void> {
  loading.value = true;
  error.value = "";
  try {
    posts.value = await api.getPosts();
  } catch (error_) {
    error.value = error_ instanceof Error ? error_.message : t("feed.loadFailed");
  } finally {
    loading.value = false;
  }
}

async function handleCreate(): Promise<void> {
  const text = content.value.trim();
  if (!text) return;

  sending.value = true;
  error.value = "";
  try {
    const created = await api.createPost(text);
    posts.value.unshift(created);
    content.value = "";
  } catch (error_) {
    error.value = error_ instanceof Error ? error_.message : t("feed.createFailed");
  } finally {
    sending.value = false;
  }
}

onMounted(loadPosts);
</script>

<template>
  <section class="feed">
    <form v-if="isAuthenticated" class="card post-form" @submit.prevent="handleCreate">
      <div class="post-form-title">{{ t("feed.newPost") }}</div>
      <textarea v-model="content" rows="3" maxlength="500" :placeholder="t('feed.placeholder')" required></textarea>
      <div class="post-form-footer">
        <span class="counter">{{ content.length }} / 500</span>
        <button class="button" type="submit" :disabled="sending || !content.trim()">
          {{ sending ? t("feed.publishing") : t("feed.publish") }}
        </button>
      </div>
    </form>

    <p v-else class="card hint">
      <RouterLink to="/login">{{ t("nav.login") }}</RouterLink
      >{{ t("feed.loginHintSuffix") }}
    </p>

    <h1 class="feed-title">{{ t("feed.title") }}</h1>

    <p v-if="!loading && posts.length > 0" class="posts-count">{{ postsCountLabel }}</p>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="hint">{{ t("feed.loading") }}</p>
    <p v-else-if="posts.length === 0" class="hint">{{ t("feed.empty") }}</p>

    <div v-else class="posts">
      <template v-for="group in groupedPosts" :key="group.key">
        <div class="day-divider">
          <span>{{ group.label }}</span>
        </div>
        <PostCard v-for="post in group.posts" :key="post.id" :post="post" />
      </template>
    </div>
  </section>
</template>
