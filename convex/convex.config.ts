import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import stripe from "@convex-dev/stripe/convex.config.js";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(rateLimiter);
app.use(stripe);

export default app;
