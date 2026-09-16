<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import { api, type Post } from "../api/client";
import PostCard from "../components/PostCard.vue";
import { useAuth } from "../composables/useAuth";

const { isAuthenticated } = useAuth();

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

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
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

async function loadPosts(): Promise<void> {
  loading.value = true;
  error.value = "";
  try {
    posts.value = await api.getPosts();
  } catch (error_) {
    error.value = error_ instanceof Error ? error_.message : "Failed to load the feed";
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
    error.value = error_ instanceof Error ? error_.message : "Failed to create the post";
  } finally {
    sending.value = false;
  }
}

onMounted(loadPosts);
</script>

<template>
  <section class="feed">
    <form v-if="isAuthenticated" class="card post-form" @submit.prevent="handleCreate">
      <div class="post-form-title">New post</div>
      <textarea v-model="content" rows="3" maxlength="500" placeholder="What's new?" required></textarea>
      <div class="post-form-footer">
        <span class="counter">{{ content.length }} / 500</span>
        <button class="button" type="submit" :disabled="sending || !content.trim()">
          {{ sending ? "Publishing…" : "Publish" }}
        </button>
      </div>
    </form>

    <p v-else class="card hint"><RouterLink to="/login">Log in</RouterLink> to write a post.</p>

    <h1 class="feed-title">Feed</h1>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="hint">Loading feed…</p>
    <p v-else-if="posts.length === 0" class="hint">Nothing here yet. Be the first!</p>

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
