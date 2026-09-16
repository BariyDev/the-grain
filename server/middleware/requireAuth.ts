import { Elysia, status } from "elysia";

import { authMiddleware } from "./auth";

export const authGuard = new Elysia({ name: "auth-guard" }).use(authMiddleware).macro({
  isAuth: {
    async resolve({ headers, jwt }) {
      const authHeader = headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return status(401, { error: "Token is missing" });
      }

      const payload = await jwt.verify(authHeader.slice(7));

      if (!payload || typeof payload.userId !== "string") {
        return status(401, { error: "Invalid or expired token" });
      }

      return { userId: payload.userId };
    },
  },
});
