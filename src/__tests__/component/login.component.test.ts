import request from "supertest";
import { Application } from "express";
import { UserRepository } from "../../modules/user/domain/user.repository";
import { createApp } from "../../app";
import { UserBuilder } from "../../modules/user/infrastructure/persistence/prisma/__tests__/user.builder";
import { TokenGenerationService } from "../../modules/user/domain/token-generation.service";
import { GetRecipientsUseCase } from "../../modules/user/application/use-cases/get-recipients/get-recipients.use-case";
import { LoginUseCase } from "../../modules/auth/application/use-cases/login/login.use-case";
import { RegisterUseCase } from "../../modules/auth/application/use-cases/register/register.use-case";
import { CreateKudosUseCase } from "../../modules/kudos/application/use-cases/create-kudos/create-kudos.use-case";
import { GetCategoriesUseCase } from "../../modules/category/application/use-cases/get-categories/get-categories.use-case";

describe("Login API (Component Test)", () => {
  let app: Application;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockTokenGenerationService: jest.Mocked<TokenGenerationService>;
  let userBuilder: UserBuilder;

  beforeEach(() => {
    // Create mock dependencies
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      deleteAll: jest.fn(),
      findAllExceptUser: jest.fn(),
    };

    mockTokenGenerationService = {
      generateToken: jest.fn().mockReturnValue("mock-token-123"),
    };

    // Create the real use case with mock dependencies
    const loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockTokenGenerationService
    );

    // Mock the register use case since we don't need it for these tests
    const mockRegisterUseCase = {
      execute: jest.fn(),
      userRepository: mockUserRepository,
      emailService: { sendConfirmationEmail: jest.fn() },
    } as unknown as RegisterUseCase;

    // Mock the get recipients use case since we don't need it for these tests
    const mockGetRecipientsUseCase = {
      execute: jest.fn(),
    } as unknown as GetRecipientsUseCase;

    const mockCreateKudosUseCase = {
      execute: jest.fn(),
    } as unknown as CreateKudosUseCase;

    const mockGetCategoriesUseCase = {
      execute: jest.fn(),
    } as unknown as GetCategoriesUseCase;

    // Create the app with the test-configured use cases
    app = createApp({
      registerUseCase: mockRegisterUseCase,
      loginUseCase,
      getRecipientsUseCase: mockGetRecipientsUseCase,
      createKudosUseCase: mockCreateKudosUseCase,
      getCategoriesUseCase: mockGetCategoriesUseCase,
    });

    // Initialize test data builder
    userBuilder = new UserBuilder();
  });

  describe("POST /users/login", () => {
    it("should return 200 and user data when credentials are valid", async () => {
      // Arrange
      const validUser = userBuilder
        .withEmail("test@example.com")
        .withPassword("SecurePass1!")
        .withName("Test User")
        .withRoleId(1) // TEAMLEAD role
        .build();

      mockUserRepository.findByEmail.mockResolvedValue(validUser);

      const requestBody = {
        email: "test@example.com",
        password: "SecurePass1!",
      };

      // Act & Assert
      const response = await request(app)
        .post("/auth/login")
        .send(requestBody)
        .expect(200);

      // Verify response structure
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("token");
      expect(typeof response.body.data.token).toBe("string");
      expect(response.body.data).toEqual({
        token: expect.any(String),
        user: {
          id: validUser.id.toString(),
          email: validUser.email.value,
          name: validUser.name,
          isTeamLead: true, // Should be true for roleId 1 (TEAMLEAD)
        },
      });

      // Verify repository was called correctly
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        requestBody.email
      );

      // Verify token generation was called
      expect(mockTokenGenerationService.generateToken).toHaveBeenCalledWith(
        validUser.id.toString()
      );
    });

    it("should return 401 when credentials are invalid", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const requestBody = {
        email: "nonexistent@example.com",
        password: "WrongPass1!",
      };

      // Act & Assert
      const response = await request(app)
        .post("/auth/login")
        .send(requestBody)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid email or password");
    });

    it("should return 400 when request body is invalid", async () => {
      // Arrange
      const invalidRequestBody = {
        email: "not-an-email",
        password: "",
      };

      // Act & Assert
      await request(app)
        .post("/auth/login")
        .send(invalidRequestBody)
        .expect(400);
    });

    it("should return 500 when an unexpected error occurs", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockRejectedValue(
        new Error("Database error")
      );

      const requestBody = {
        email: "test@example.com",
        password: "SecurePass1!",
      };

      // Act & Assert
      const response = await request(app)
        .post("/auth/login")
        .send(requestBody)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("An unexpected error occurred");
    });
  });
});
