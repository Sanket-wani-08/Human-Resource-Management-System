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

app.use(cors({
  origin: true,
  credentials: true,
}));
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