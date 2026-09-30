# Internationalization

The interface is available in **English** (default) and **Russian**. The language is switched in the header and the choice is remembered.

## How it works

- The library is [vue-i18n](https://vue-i18n.intlify.dev/) in Composition API mode (`legacy: false`).
- Dictionaries: `client/src/i18n/en.json` and `client/src/i18n/ru.json`.
- The engine is configured in `client/src/i18n/index.ts` and registered in `client/src/main.ts` (`app.use(i18n)`).
- Components get helpers from `useI18n()`: `t()` for strings, `d()` for dates and time, `locale` for the current language.

## Choosing the language

```
localStorage["locale"]  →  "ru" or "en"; anything else (or nothing) falls back to "en"
```

- On startup the saved value is used; `fallbackLocale: "en"` guarantees that a missing translation shows the English string instead of breaking the UI.
- `setLocale(locale)` switches the engine (reactively) and persists the choice.
- The header switch (`App.vue`) is a rectangular `EN | RU` toggle: the wheat thumb slides between the cells, the active cell gets dark text. Layout order in the header: username → switch → logout button.

## Using strings in components

```vue
<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t, d } = useI18n();
</script>

<template>
  <h1>{{ t("feed.title") }}</h1>
  <span>{{ t("feed.posts", posts.length) }}</span>
  <time>{{ d(post.createdAt, "time") }}</time>
</template>
```

- Keys are grouped: `nav.*`, `auth.*`, `feed.*`, `post.*`.
- `t("feed.posts", n)` selects a plural form (see below); `t("key", { count: n })` also works.
- The library tracks reactivity itself: after `setLocale()` every component that uses `t`/`d` re-renders automatically.

## Pluralization

A message may contain several forms separated by `|`. The index is chosen by a per-language rule:

| Language | Rule                                       | Message                                                         |
| -------- | ------------------------------------------ | --------------------------------------------------------------- |
| `en`     | built-in (`0 → 0`, `1 → 1`, otherwise `2`) | `no posts \| {count} post \| {count} posts`                     |
| `ru`     | custom `pluralRuleRu`                      | `нет постов \| {count} пост \| {count} поста \| {count} постов` |

The Russian rule follows the vue-i18n documentation ("Custom Pluralization", the Slavic example):

```ts
function pluralRuleRu(choice: number, choicesLength: number): number {
  if (choice === 0) return 0; // нет постов
  const isTeen = choice > 10 && choice < 20; // 11–19 is an exception
  const hasEndingOne = choice % 10 === 1;
  if (!isTeen && hasEndingOne) return 1; // 1, 21, 101 → пост
  if (!isTeen && choice % 10 >= 2 && choice % 10 <= 4) return 2; // 2–4 → поста
  return choicesLength < 4 ? 2 : 3; // the rest → постов
}
```

It is registered as `pluralRules: { ru: pluralRuleRu }`. Note the option name: for the Composition API it is `pluralRules`; the Options API name `pluralizationRules` is silently ignored. The function receives both the number and the number of forms in the message, so it keeps working if a message is written with fewer forms.

## Dates and time

`d(value, "long")` and `d(value, "time")` use `datetimeFormats`:

| Language | `long`                | `time`               |
| -------- | --------------------- | -------------------- |
| `en`     | `September 16, 2026`  | `12:15 PM` (12-hour) |
| `ru`     | `16 сентября 2026 г.` | `12:15` (24-hour)    |

"Today" and "Yesterday" are ordinary translations (`feed.today`, `feed.yesterday`).

## Message syntax notes

- `{count}` — interpolation of the number passed to `t`.
- `|` — separates plural forms.
- `@` is a **special character** in vue-i18n (linked messages). If a literal `@` is needed inside a message, escape it: `you{'@'}example.com`. That is why the email placeholder `you@example.com` lives directly in the markup instead of the dictionaries.
- A missing key falls back to English, then to the key itself — the app never crashes because of a missing translation.

## Adding a third language

1. Create `client/src/i18n/xx.json` with the same key structure.
2. Register it in `client/src/i18n/index.ts`: add it to `messages` (and to `pluralRules` / `datetimeFormats` if the language needs them).
3. Add a button for it to the switch in `App.vue`.

No page or component changes are required.
