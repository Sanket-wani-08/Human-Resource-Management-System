import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";
import { startCronJobs } from "./services/cron.service";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    startCronJobs();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      `Failed to start server: ${
        error instanceof Error ? error.message : error
      }`
    );

    process.exit(1);
  }
};

startServer();