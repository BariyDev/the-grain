import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not set in .env");
}

export const authMiddleware = new Elysia({ name: "auth-middleware" }).use(
  jwt({
    name: "jwt",
    secret,
  }),
);
