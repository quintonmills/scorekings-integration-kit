import mongoose from "mongoose";
import { app } from "./app";
import { connectToDatabase } from "./config/database";

const port = Number(process.env.PORT) || 3000;

async function startServer(): Promise<void> {
  await connectToDatabase();
  const server = app.listen(port, () => {
    console.info(`ScoreKings Integration API listening on port ${port}.`);
  });

  const shutdown = (signal: string): void => {
    console.info(`${signal} received; closing the API server.`);
    server.close(async (error) => {
      if (error) {
        console.error("Failed to close the HTTP server cleanly.", error);
        process.exitCode = 1;
      }
      try {
        await mongoose.disconnect();
      } catch (disconnectError) {
        console.error("Failed to disconnect from MongoDB cleanly.", disconnectError);
        process.exitCode = 1;
      }
    });
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

void startServer().catch((error: unknown) => {
  console.error("API startup failed.", error);
  process.exitCode = 1;
});
