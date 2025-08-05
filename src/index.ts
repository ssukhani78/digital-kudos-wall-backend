import { createApp } from "./app";
import { PrismaClient } from "./shared/infrastructure/persistence/prisma/client";
import { RegisterUseCase } from "./modules/auth/application/use-cases/register/register.use-case";
import { LoginUseCase } from "./modules/auth/application/use-cases/login/login.use-case";
import { GetRecipientsUseCase } from "./modules/user/application/use-cases/get-recipients/get-recipients.use-case";
import { CreateKudosUseCase } from "./modules/kudos/application/use-cases/create-kudos/create-kudos.use-case";
import { GetCategoriesUseCase } from "./modules/category/application/use-cases/get-categories/get-categories.use-case";
import { PrismaAuthRepository } from "./modules/auth/infrastructure/persistence/prisma/prisma-auth.repository";
import { PrismaUserRepository } from "./modules/user/infrastructure/persistence/prisma/prisma-user.repository";
import { PrismaKudosRepository } from "./modules/kudos/infrastructure/persistence/prisma/prisma-kudos.repository";
import { PrismaCategoryRepository } from "./modules/category/infrastructure/persistence/prisma/prisma-category.repository";
import { PrismaRoleRepository } from "./modules/user/infrastructure/persistence/prisma/prisma-role.repository";
import { NodemailerEmailService } from "./modules/user/infrastructure/services/nodemailer-email.service";
import { SimpleTokenGenerationService } from "./modules/user/infrastructure/services/simple-token-generation.service";

const prisma = new PrismaClient();

// Initialize repositories
const authRepository = new PrismaAuthRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);
const kudosRepository = new PrismaKudosRepository(prisma);
const categoryRepository = new PrismaCategoryRepository(prisma);
const roleRepository = new PrismaRoleRepository(prisma);

// Initialize services
const emailService = new NodemailerEmailService();
const tokenGenerationService = new SimpleTokenGenerationService();

// Initialize use cases
const registerUseCase = new RegisterUseCase(
  authRepository,
  emailService,
  roleRepository
);
const loginUseCase = new LoginUseCase(authRepository, tokenGenerationService);
const getRecipientsUseCase = new GetRecipientsUseCase(userRepository);
const createKudosUseCase = new CreateKudosUseCase(
  kudosRepository,
  userRepository,
  categoryRepository
);
const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);

// Create app with dependencies
const app = createApp({
  registerUseCase,
  loginUseCase,
  getRecipientsUseCase,
  createKudosUseCase,
  getCategoriesUseCase,
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Digital Kudos Wall Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});
