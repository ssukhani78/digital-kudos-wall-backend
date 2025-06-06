import dotenv from "dotenv";
import { createApp } from "./app";
import { RegisterUserUseCase } from "./modules/user/application/register-user.use-case";
import { PrismaUserRepository } from "./modules/user/infrastructure/persistence/prisma/prisma-user.repository";
import { NodemailerEmailService } from "./modules/user/infrastructure/services/nodemailer-email.service";
import { PrismaClient } from "@prisma/client";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

async function startServer(): Promise<void> {
  try {
    // Infrastructure
    const prisma = new PrismaClient();
    const userRepository = new PrismaUserRepository(prisma);
    const emailService = new NodemailerEmailService();

    // Application
    const registerUserUseCase = new RegisterUserUseCase(userRepository, emailService);

    const app = createApp({ registerUserUseCase });

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
