import dotenv from "dotenv";
import { createApp } from "./app.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

async function startServer(): Promise<void> {
  try {
    const app = createApp();

    app.listen(PORT, () => {
      console.log(`🚀 Digital Kudos Wall Backend running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
