import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import setupUserRoutes from "./modules/user/presentation/routes/user.routes";
import { makeKudosRoutes } from "./modules/kudos/presentation/routes/kudos.routes";
import { makeAuthRoutes } from "./modules/auth/presentation/routes/auth.routes";
import { makeCategoryRoutes } from "./modules/category/presentation/routes/category.routes";
import { RegisterUseCase } from "./modules/auth/application/use-cases/register/register.use-case";
import { LoginUseCase } from "./modules/auth/application/use-cases/login/login.use-case";
import { GetRecipientsUseCase } from "./modules/user/application/use-cases/get-recipients/get-recipients.use-case";
import { CreateKudosUseCase } from "./modules/kudos/application/use-cases/create-kudos/create-kudos.use-case";
import { GetCategoriesUseCase } from "./modules/category/application/use-cases/get-categories/get-categories.use-case";
import { RegisterController } from "./modules/auth/presentation/controllers/register.controller";
import { LoginController } from "./modules/auth/presentation/controllers/login.controller";
import { KudosController } from "./modules/kudos/presentation/controllers/kudos.controller";
import { CategoryController } from "./modules/category/presentation/controllers/category.controller";
import { testSupportRouter } from "./modules/test-support/http/test-support.routes";

export interface AppDependencies {
  registerUseCase: RegisterUseCase;
  loginUseCase: LoginUseCase;
  getRecipientsUseCase: GetRecipientsUseCase;
  createKudosUseCase: CreateKudosUseCase;
  getCategoriesUseCase: GetCategoriesUseCase;
}

export function createApp(dependencies: AppDependencies): Application {
  const app = express();
  app.use(helmet());

  // Configure CORS based on environment
  const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3000"];

  // In UAT, also allow the IP-based access
  if (process.env.NODE_ENV === "uat") {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const frontendUrlObj = new URL(frontendUrl);
    // Add IP-based origin if FRONTEND_URL is hostname-based, and vice versa
    if (frontendUrlObj.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      // If FRONTEND_URL is IP-based, also allow hostname-based
      allowedOrigins.push("http://uat.digital-kudos-wall.com:3000");
    } else {
      // If FRONTEND_URL is hostname-based, also allow IP-based
      const ipBasedUrl = frontendUrl.replace(
        frontendUrlObj.hostname,
        "13.201.16.118"
      );
      allowedOrigins.push(ipBasedUrl);
    }
  }

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Setup Auth routes
  const registerController = new RegisterController(
    dependencies.registerUseCase
  );
  const loginController = new LoginController(dependencies.loginUseCase);
  const authRoutes = makeAuthRoutes(registerController, loginController);
  app.use("/auth", authRoutes);

  // Setup User routes
  const userRoutes = setupUserRoutes({
    getRecipientsUseCase: dependencies.getRecipientsUseCase,
  });
  app.use("/users", userRoutes);

  // Setup Category routes
  const categoryController = new CategoryController(
    dependencies.getCategoriesUseCase
  );
  const categoryRoutes = makeCategoryRoutes(categoryController);
  app.use("/categories", categoryRoutes);

  // Setup Kudos routes
  const kudosController = new KudosController(dependencies.createKudosUseCase);
  const kudosRoutes = makeKudosRoutes(kudosController);
  app.use("/kudos", kudosRoutes);

  // Conditionally add test-support routes
  // This is a critical step to ensure test-only endpoints are not available in production
  if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "uat") {
    app.use("/test-support", testSupportRouter);
  }

  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "digital-kudos-wall-backend",
      version: "1.0.0",
    });
  });

  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      message: "Welcome to Digital Kudos Wall Backend API",
      version: "1.0.0",
      endpoints: {
        health: "/health",
        auth: "/auth",
        users: "/users",
        categories: "/categories",
        kudos: "/kudos",
      },
    });
  });

  app.use("*", (req: Request, res: Response) => {
    res.status(404).json({
      error: "Not Found",
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
