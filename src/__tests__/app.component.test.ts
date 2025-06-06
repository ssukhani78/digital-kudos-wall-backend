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

  describe("POST /api/v1/users/register", () => {
    it("should return 201 when user is successfully registered", async () => {
      // Arrange
      const registerUserUseCase = new RegisterUserUseCase(mockUserRepository, mockEmailService);
      const app = createApp({ registerUserUseCase });

      const requestBody = {
        email: "test@example.com",
        password: "ValidPassword123!",
      };

      // Mock the use case dependencies
      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (mockUserRepository.save as jest.Mock).mockResolvedValue(undefined);

      // Act
      const response = await request(app).post("/api/v1/users/register").send(requestBody).expect(201);

      // Assert
      expect(response.body).toEqual({
        id: expect.any(String),
        email: requestBody.email,
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledWith(requestBody.email);
    });
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
