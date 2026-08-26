import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();

/*
 * CORS Configuration
 *
 * Local development:
 *   http://localhost:5173
 *
 * Production:
 *   Set CLIENT_URL in Render environment variables:
 *
 *   CLIENT_URL=https://human-resource-management-system-zeta-lilac.vercel.app
 */

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
]
  .filter((origin): origin is string => Boolean(origin))
  .map((origin) => origin.trim().replace(/\/+$/, ""));

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header.
      // Useful for Postman, server-to-server requests, etc.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error("Blocked by CORS:", origin);

      return callback(
        new Error(`Origin ${origin} is not allowed by CORS`)
      );
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

// Security headers
app.use(helmet());

// HTTP request logging
app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
 * API Routes
 *
 * Example:
 * POST /api/auth/login
 * GET  /api/employees
 */
app.use("/api", routes);

/*
 * Global Error Handler
 *
 * Keep this AFTER all routes.
 */
app.use(errorHandler);

export default app;