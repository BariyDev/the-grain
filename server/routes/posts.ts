import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

import { db } from "../db/client";
import { posts, users } from "../db/schema";
import { authGuard } from "../middleware/requireAuth";

export const postsRoutes = new Elysia({ prefix: "/api/posts" })
  .use(authGuard)

  // ======================
  // POST /api/posts — create a post (protected)
  // ======================
  .post(
    "/",
    async ({ body, userId, set }) => {
      const [newPost] = await db
        .insert(posts)
        .values({
          userId,
          content: body.content,
        })
        .returning();

      if (!newPost) {
        set.status = 500;
        return { error: "Failed to create post" };
      }

      const [author] = await db
        .select({ id: users.id, username: users.username })
        .from(users)
        .where(eq(users.id, userId));

      set.status = 201;
      return {
        id: newPost.id,
        userId: newPost.userId,
        content: newPost.content,
        createdAt: newPost.createdAt,
        author: author ?? null,
      };
    },
    {
      body: t.Object({
        content: t.String({ minLength: 1, maxLength: 500 }),
      }),
      isAuth: true,
    },
  );
