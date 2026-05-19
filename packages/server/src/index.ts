import { Elysia, status } from "elysia";
import { cookie } from "@elysiajs/cookie";
import { openapi } from "@elysiajs/openapi";
import { cors } from "@elysiajs/cors";
import { rateLimit } from "elysia-rate-limit";

import { authModule } from "./modules/auth";
import { walletsModule } from "./modules/wallets";
import { walletItemsModule } from "./modules/wallet_items";
import { dashboardModule } from "./modules/dashboard";

export const port = Number.parseInt(process.env.PORT ?? "", 10);
export const resolvedPort = Number.isFinite(port) ? port : 3000;
export const isProd =
  process.env.NODE_ENV === ("production" as "development" | "production");

const app = new Elysia()
  .use(
    cors({
      origin: ["http://localhost:5173", "http://localhost:4173"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .use(cookie())
  .use(
    openapi({
      documentation: {
        tags: [
          { name: "Auth", description: "Authentication endpoints" },
          { name: "Wallets", description: "Wallet management endpoints" },
          {
            name: "Wallet Items",
            description: "Wallet items management endpoints",
          },
        ],
      },
    }),
  )
  // Global Error Handler
  .onError(({ code }) => {
    if (code === "VALIDATION") {
      return status(422, {
        success: false as const,
        message: "Invalid payload data",
      });
    }

    // Commented out: no route is returning 404
    // if (code === "NOT_FOUND") {
    //   return status(404, {
    //     success: false as const,
    //     message: "Resource not found",
    //   });
    // }

    if (code === "INTERNAL_SERVER_ERROR") {
      return status(500, {
        success: false as const,
        message: "Internal server error",
      });
    }
  })

  .get("/", () => "Hello Elysia")

  .use(authModule)
  .use(
    rateLimit({
      max: isProd ? 100 : 1000,
      duration: 60 * 1000, // 1 minute
      errorResponse: new Response("rate-limited", {
        status: 429,
        headers: new Headers({
          "Content-Type": "text/plain",
          "Custom-Header": "custom",
        }),
      }),
    }),
  )
  .use(walletsModule)
  .use(walletItemsModule)
  .use(dashboardModule)
  .listen(resolvedPort);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
