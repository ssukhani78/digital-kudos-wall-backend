import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import setupUserRoutes from "./modules/user/presentation/user.routes";
import { RegisterUserUseCase } from "./modules/user/application/register-user.use-case";
import { testSupportRouter } from "./modules/test-support/http/test-support.routes";

interface AppDependencies {
  registerUserUseCase: RegisterUserUseCase;
}

export function createApp(dependencies: AppDependencies): Application {
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const userRoutes = setupUserRoutes(dependencies.registerUserUseCase);
  app.use("/users", userRoutes);

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

  app.get("/kudos", (req: Request, res: Response) => {
    res.status(200).json({
      message: "Digital Kudos Wall API - MVP Version",
      kudos: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
      },
    });
  });

  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      message: "Welcome to Digital Kudos Wall Backend API",
      version: "1.0.0",
      endpoints: {
        health: "/health",
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
