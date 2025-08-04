import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import setupUserRoutes from "./modules/user/presentation/routes/user.routes";
import { makeKudosRoutes } from "./modules/kudos/presentation/routes/kudos.routes";
import { RegisterUserUseCase } from "./modules/user/application/use-cases/register-user/register-user.use-case";
import { LoginUseCase } from "./modules/user/application/use-cases/login/login.use-case";
import { GetRecipientsUseCase } from "./modules/user/application/use-cases/get-recipients/get-recipients.use-case";
import { CreateKudosUseCase } from "./modules/kudos/application/use-cases/create-kudos/create-kudos.use-case";
import { GetCategoriesUseCase } from "./modules/kudos/application/use-cases/get-categories/get-categories.use-case";
import { KudosController } from "./modules/kudos/presentation/controllers/kudos.controller";
import { testSupportRouter } from "./modules/test-support/http/test-support.routes";

export interface AppDependencies {
  registerUserUseCase: RegisterUserUseCase;
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

  const userRoutes = setupUserRoutes({
    registerUserUseCase: dependencies.registerUserUseCase,
    loginUseCase: dependencies.loginUseCase,
    getRecipientsUseCase: dependencies.getRecipientsUseCase,
  });
  app.use("/users", userRoutes);

  // Setup Kudos routes
  const kudosController = new KudosController(
    dependencies.createKudosUseCase,
    dependencies.getCategoriesUseCase
  );
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
        users: "/users",
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
