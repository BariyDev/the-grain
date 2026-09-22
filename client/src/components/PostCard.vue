<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { Post } from "../api/client";

import { useAuth } from "../composables/useAuth";

const props = defineProps<{ post: Post }>();

const { user } = useAuth();
const { t, d } = useI18n();

const isOwn = computed(() => user.value !== null && props.post.userId === user.value.id);

function formatTime(value: string): string {
  return d(new Date(value), "time");
}
</script>

<template>
  <article class="card post">
    <header class="post-header">
      <span class="post-author" :class="{ 'post-author--own': isOwn }">
        {{ post.author?.username ?? t("post.unknownAuthor") }}
      </span>
      <time class="post-date" :datetime="post.createdAt">{{ formatTime(post.createdAt) }}</time>
    </header>
    <p class="post-content">{{ post.content }}</p>
  </article>
</template>
