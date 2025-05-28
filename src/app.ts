import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";

export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS middleware
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "digital-kudos-wall-backend",
      version: "1.0.0",
    });
  });

  // API routes
  app.get("/api/v1/kudos", (req: Request, res: Response) => {
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

  // Root endpoint
  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      message: "Welcome to Digital Kudos Wall Backend API",
      version: "1.0.0",
      endpoints: {
        health: "/health",
        kudos: "/api/v1/kudos",
      },
    });
  });

  // 404 handler
  app.use("*", (req: Request, res: Response) => {
    res.status(404).json({
      error: "Not Found",
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
