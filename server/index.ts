import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";

import { authRoutes } from "./routes/auth";

const app = new Elysia()
  .use(cors())
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      const first = error.all[0];
      return {
        error: "Invalid data",
        field: first?.path.replace("/", "") ?? "unknown",
        message: first?.message ?? "Validation error",
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Route not found" };
    }

    if (code === "PARSE") {
      set.status = 400;
      return { error: "Malformed JSON in request body" };
    }

    console.error("Unhandled error:", error);
    set.status = 500;
    return { error: "Server error" };
  })
  .get("/api/hello", () => ({ message: "Server is running!" }))
  .use(authRoutes)
  .listen(3000);

console.log(`Elysia is running: http://localhost:${app.server?.port ?? 3000}`);
