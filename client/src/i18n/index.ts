import { createI18n } from "vue-i18n";

import en from "./en.json";
import ru from "./ru.json";

export type Locale = "en" | "ru";

const stored = localStorage.getItem("locale");
const initial: Locale = stored === "ru" ? "ru" : "en";

function pluralRuleRu(choice: number, choicesLength: number): number {
  if (choice === 0) return 0;

  const isTeen = choice > 10 && choice < 20;
  const hasEndingOne = choice % 10 === 1;

  if (!isTeen && hasEndingOne) return 1;
  if (!isTeen && choice % 10 >= 2 && choice % 10 <= 4) return 2;

  return choicesLength < 4 ? 2 : 3;
}

export const i18n = createI18n({
  legacy: false,
  locale: initial,
  fallbackLocale: "en",
  messages: { en, ru },
  pluralRules: { ru: pluralRuleRu },
  datetimeFormats: {
    en: {
      long: { day: "numeric", month: "long", year: "numeric" },
      time: { hour: "2-digit", minute: "2-digit", hour12: true },
    },
    ru: {
      long: { day: "numeric", month: "long", year: "numeric" },
      time: { hour: "2-digit", minute: "2-digit", hour12: false },
    },
  },
});

export function setLocale(locale: Locale): void {
  i18n.global.locale.value = locale;
  localStorage.setItem("locale", locale);
}
