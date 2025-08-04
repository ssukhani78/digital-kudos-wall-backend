import { PrismaClient } from "@prisma/client";
import { createApp } from "./app";
import { RegisterUserUseCase } from "./modules/user/application/use-cases/register-user/register-user.use-case";
import { LoginUseCase } from "./modules/user/application/use-cases/login/login.use-case";
import { GetRecipientsUseCase } from "./modules/user/application/use-cases/get-recipients/get-recipients.use-case";
import { PrismaUserRepository } from "./modules/user/infrastructure/persistence/prisma/prisma-user.repository";
import { PrismaRoleRepository } from "./modules/user/infrastructure/persistence/prisma/prisma-role.repository";
import { NodemailerEmailService } from "./modules/user/infrastructure/services/nodemailer-email.service";
import { TestEmailService } from "./modules/user/infrastructure/services/test-email.service";
import { EmailService } from "./modules/user/domain/email.service";
import { SimpleTokenGenerationService } from "./modules/user/infrastructure/services/simple-token-generation.service";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3001;

// Initialize infrastructure dependencies
const prisma = new PrismaClient();
const userRepository = new PrismaUserRepository(prisma);
const roleRepository = new PrismaRoleRepository(prisma);

// Configure email service based on environment
let emailService: EmailService;
if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "uat") {
  emailService = TestEmailService.getInstance();
} else {
  emailService = new NodemailerEmailService();
}

// Initialize token generation service
const tokenGenerationService = new SimpleTokenGenerationService();

// Initialize use cases with their dependencies
const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  emailService,
  roleRepository
);
const loginUseCase = new LoginUseCase(userRepository, tokenGenerationService);
const getRecipientsUseCase = new GetRecipientsUseCase(userRepository);

// Create and start the application
const app = createApp({
  registerUserUseCase,
  loginUseCase,
  getRecipientsUseCase,
});

app.listen(PORT, () => {
  console.log(`🚀 Digital Kudos Wall Backend running on port ${PORT}`);
});

export default app;
