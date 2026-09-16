import { createRouter, createWebHistory } from "vue-router";

import FeedPage from "../pages/FeedPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import RegisterPage from "../pages/RegisterPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/feed" },
    { path: "/feed", name: "feed", component: FeedPage },
    { path: "/login", name: "login", component: LoginPage },
    { path: "/register", name: "register", component: RegisterPage },
  ],
});

export default router;
