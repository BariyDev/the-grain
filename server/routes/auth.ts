import { eq, or } from "drizzle-orm";
import { Elysia, t } from "elysia";

import { db } from "../db/client";
import { users } from "../db/schema";
import { authGuard } from "../middleware/requireAuth";

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(authGuard)

  // ======================
  // POST /api/auth/register
  // ======================
  .post(
    "/register",
    async ({ body, set }) => {
      const { email, username, password } = body;

      const existing = await db
        .select()
        .from(users)
        .where(or(eq(users.email, email), eq(users.username, username)));

      const conflict = existing[0];
      if (conflict) {
        set.status = 409;
        const taken = conflict.email === email ? "email" : "username";
        return { error: `${taken} is already taken` };
      }

      const passwordHash = await Bun.password.hash(password);

      let newUser;
      try {
        const result = await db.insert(users).values({ email, username, passwordHash }).returning();
        newUser = result[0];
      } catch (error) {
        const isDuplicate = typeof error === "object" && error !== null && "code" in error && error.code === "23505";

        if (isDuplicate) {
          set.status = 409;
          return { error: "Email or username is already taken" };
        }

        console.error("DB error while creating user:", error);
        set.status = 500;
        return { error: "Server error" };
      }

      if (!newUser) {
        set.status = 500;
        return { error: "Failed to create user" };
      }

      set.status = 201;
      return {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        createdAt: newUser.createdAt,
      };
    },
    {
      body: t.Object({
        email: t.String({ pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" }),
        username: t.String({ minLength: 3, maxLength: 50 }),
        password: t.String({ minLength: 6, maxLength: 100 }),
      }),
    },
  );
