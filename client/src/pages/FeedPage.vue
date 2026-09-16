<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import { api, type Post } from "../api/client";
import PostCard from "../components/PostCard.vue";
import { useAuth } from "../composables/useAuth";

const { isAuthenticated } = useAuth();

const posts = ref<Post[]>([]);
const error = ref("");
const loading = ref(true);

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

onMounted(loadPosts);
</script>

<template>
  <section class="feed">
    <p v-if="!isAuthenticated" class="card hint"><RouterLink to="/login">Log in</RouterLink> to write a post.</p>

    <h1 class="feed-title">Feed</h1>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="hint">Loading feed…</p>
    <p v-else-if="posts.length === 0" class="hint">Nothing here yet. Be the first!</p>

    <div v-else class="posts">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </section>
</template>
