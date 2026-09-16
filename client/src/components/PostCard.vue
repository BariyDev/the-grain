<script setup lang="ts">
import { computed } from "vue";

import type { Post } from "../api/client";

import { useAuth } from "../composables/useAuth";

const props = defineProps<{ post: Post }>();

const { user } = useAuth();

const isOwn = computed(() => user.value !== null && props.post.userId === user.value.id);

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatTime(value: string): string {
  const date = new Date(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
</script>

<template>
  <article class="card post">
    <header class="post-header">
      <span class="post-author" :class="{ 'post-author--own': isOwn }">
        {{ post.author?.username ?? "Unknown" }}
      </span>
      <time class="post-date" :datetime="post.createdAt">{{ formatTime(post.createdAt) }}</time>
    </header>
    <p class="post-content">{{ post.content }}</p>
  </article>
</template>
