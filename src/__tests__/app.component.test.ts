import request from "supertest";
import { createApp } from "../app";
import { RegisterUserUseCase } from "../modules/user/application/register-user.use-case";
import { UserRepository } from "../modules/user/domain/user.repository";
import { EmailService } from "../modules/user/domain/email.service";

describe("App Component Tests", () => {
  let mockUserRepository: UserRepository;
  let mockEmailService: EmailService;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };

    mockEmailService = {
      sendConfirmationEmail: jest.fn(),
    };
  });

  describe("GET /", () => {
    test("should return welcome message", async () => {
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(mockUserRepository, mockEmailService),
      });
      const response = await request(app).get("/").expect(200);

      expect(response.body).toEqual({
        message: "Welcome to Digital Kudos Wall Backend API",
        version: "1.0.0",
        endpoints: {
          health: "/health",
          kudos: "/api/v1/kudos",
        },
      });
    });
  });

  describe("GET /health", () => {
    test("should return health status", async () => {
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(mockUserRepository, mockEmailService),
      });
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toMatchObject({
        status: "healthy",
        service: "digital-kudos-wall-backend",
        version: "1.0.0",
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe("GET /api/v1/kudos", () => {
    test("should return empty kudos list", async () => {
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(mockUserRepository, mockEmailService),
      });
      const response = await request(app).get("/api/v1/kudos").expect(200);

      expect(response.body).toEqual({
        message: "Digital Kudos Wall API - MVP Version",
        kudos: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
        },
      });
    });
  });

  describe("GET /nonexistent", () => {
    test("should return 404 for unknown routes", async () => {
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(mockUserRepository, mockEmailService),
      });
      const response = await request(app).get("/nonexistent").expect(404);

      expect(response.body).toMatchObject({
        error: "Not Found",
        message: "Route /nonexistent not found",
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
