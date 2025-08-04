import request from "supertest";
import { createApp } from "../../app";
import { RegisterUserUseCase } from "../../modules/user/application/use-cases/register-user/register-user.use-case";
import { LoginUseCase } from "../../modules/user/application/use-cases/login/login.use-case";
import { GetRecipientsUseCase } from "../../modules/user/application/use-cases/get-recipients/get-recipients.use-case";
import { UserRepository } from "../../modules/user/domain/user.repository";
import { EmailService } from "../../modules/user/domain/email.service";
import { RoleRepository } from "../../modules/user/domain/role.repository";
import { UserBuilder } from "../../modules/user/infrastructure/persistence/prisma/__tests__/user.builder";
import { RoleType } from "../../modules/user/domain/value-objects/role-type";
import { UniqueEntityID } from "../../shared/domain/unique-entity-id";
import { TokenGenerationService } from "../../modules/user/domain/token-generation.service";

describe("Recipients Component Tests", () => {
  let mockUserRepository: UserRepository;
  let mockEmailService: EmailService;
  let mockRoleRepository: RoleRepository;
  let mockTokenGenerationService: TokenGenerationService;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      deleteAll: jest.fn(),
      findAllExceptUser: jest.fn(),
    };

    mockEmailService = {
      sendConfirmationEmail: jest.fn(),
    };

    mockRoleRepository = {
      findById: jest.fn().mockResolvedValue(true),
    };

    mockTokenGenerationService = {
      generateToken: jest.fn(),
    };
  });

  describe("GET /users/recipients", () => {
    it("should return 200 with list of recipients when valid token is provided", async () => {
      // Arrange
      const loggedInUserId = "user-123";
      const mockRecipients = [
        new UserBuilder()
          .withId(new UniqueEntityID("user-1"))
          .withName("User One")
          .withEmail("user1@example.com")
          .withRoleId(2) // MEMBER
          .build(),
        new UserBuilder()
          .withId(new UniqueEntityID("user-2"))
          .withName("User Two")
          .withEmail("user2@example.com")
          .withRoleId(1) // TEAMLEAD
          .build(),
      ];

      const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(
          mockUserRepository,
          mockEmailService,
          mockRoleRepository
        ),
        loginUseCase: new LoginUseCase(
          mockUserRepository,
          mockTokenGenerationService
        ),
        getRecipientsUseCase,
      });

      (mockUserRepository.findAllExceptUser as jest.Mock).mockResolvedValue(
        mockRecipients
      );

      // Create a valid token for the logged-in user
      const expiryTime = Date.now() + 30 * 60 * 1000; // 30 minutes from now
      const token = Buffer.from(`${loggedInUserId}:${expiryTime}`).toString(
        "base64"
      );

      // Act
      const response = await request(app)
        .get("/users/recipients")
        .set("authtoken", token)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        data: [
          { id: "user-1", name: "User One" },
          { id: "user-2", name: "User Two" },
        ],
      });
      expect(mockUserRepository.findAllExceptUser).toHaveBeenCalledWith(
        loggedInUserId
      );
    });

    it("should return 401 when no authToken is provided", async () => {
      // Arrange
      const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(
          mockUserRepository,
          mockEmailService,
          mockRoleRepository
        ),
        loginUseCase: new LoginUseCase(
          mockUserRepository,
          mockTokenGenerationService
        ),
        getRecipientsUseCase,
      });

      // Act
      const response = await request(app).get("/users/recipients").expect(401);

      // Assert
      expect(response.body.message).toBe("authToken in headers is required");
      expect(mockUserRepository.findAllExceptUser).not.toHaveBeenCalled();
    });

    it("should return 401 when invalid token is provided", async () => {
      // Arrange
      const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(
          mockUserRepository,
          mockEmailService,
          mockRoleRepository
        ),
        loginUseCase: new LoginUseCase(
          mockUserRepository,
          mockTokenGenerationService
        ),
        getRecipientsUseCase,
      });

      const invalidToken = "invalid-token";

      // Act
      const response = await request(app)
        .get("/users/recipients")
        .set("authtoken", invalidToken)
        .expect(401);

      // Assert
      expect(response.body.message).toBe("Invalid or expired token");
      expect(mockUserRepository.findAllExceptUser).not.toHaveBeenCalled();
    });

    it("should return 401 when expired token is provided", async () => {
      // Arrange
      const loggedInUserId = "user-123";
      const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(
          mockUserRepository,
          mockEmailService,
          mockRoleRepository
        ),
        loginUseCase: new LoginUseCase(
          mockUserRepository,
          mockTokenGenerationService
        ),
        getRecipientsUseCase,
      });

      // Create an expired token (expired 1 hour ago)
      const expiredTime = Date.now() - 60 * 60 * 1000; // 1 hour ago
      const expiredToken = Buffer.from(
        `${loggedInUserId}:${expiredTime}`
      ).toString("base64");

      // Act
      const response = await request(app)
        .get("/users/recipients")
        .set("authtoken", expiredToken)
        .expect(401);

      // Assert
      expect(response.body.message).toBe("Invalid or expired token");
      expect(mockUserRepository.findAllExceptUser).not.toHaveBeenCalled();
    });

    it("should return 500 when repository throws an error", async () => {
      // Arrange
      const loggedInUserId = "user-123";
      const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(
          mockUserRepository,
          mockEmailService,
          mockRoleRepository
        ),
        loginUseCase: new LoginUseCase(
          mockUserRepository,
          mockTokenGenerationService
        ),
        getRecipientsUseCase,
      });

      (mockUserRepository.findAllExceptUser as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      // Create a valid token
      const expiryTime = Date.now() + 30 * 60 * 1000;
      const token = Buffer.from(`${loggedInUserId}:${expiryTime}`).toString(
        "base64"
      );

      // Act
      const response = await request(app)
        .get("/users/recipients")
        .set("authtoken", token)
        .expect(500);

      // Assert
      expect(response.body.message).toBe("An unexpected error occurred");
      expect(mockUserRepository.findAllExceptUser).toHaveBeenCalledWith(
        loggedInUserId
      );
    });

    it("should return empty array when no other users exist", async () => {
      // Arrange
      const loggedInUserId = "user-123";
      const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(
          mockUserRepository,
          mockEmailService,
          mockRoleRepository
        ),
        loginUseCase: new LoginUseCase(
          mockUserRepository,
          mockTokenGenerationService
        ),
        getRecipientsUseCase,
      });

      (mockUserRepository.findAllExceptUser as jest.Mock).mockResolvedValue([]);

      // Create a valid token
      const expiryTime = Date.now() + 30 * 60 * 1000;
      const token = Buffer.from(`${loggedInUserId}:${expiryTime}`).toString(
        "base64"
      );

      // Act
      const response = await request(app)
        .get("/users/recipients")
        .set("authtoken", token)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        data: [],
      });
      expect(mockUserRepository.findAllExceptUser).toHaveBeenCalledWith(
        loggedInUserId
      );
    });

    it("should exclude the logged-in user from the results", async () => {
      // Arrange
      const loggedInUserId = "user-123";
      const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);
      const app = createApp({
        registerUserUseCase: new RegisterUserUseCase(
          mockUserRepository,
          mockEmailService,
          mockRoleRepository
        ),
        loginUseCase: new LoginUseCase(
          mockUserRepository,
          mockTokenGenerationService
        ),
        getRecipientsUseCase,
      });

      const mockRecipients = [
        new UserBuilder()
          .withId(new UniqueEntityID("user-456"))
          .withName("Other User")
          .withEmail("other@example.com")
          .withRoleId(2) // MEMBER
          .build(),
      ];

      (mockUserRepository.findAllExceptUser as jest.Mock).mockResolvedValue(
        mockRecipients
      );

      // Create a valid token
      const expiryTime = Date.now() + 30 * 60 * 1000;
      const token = Buffer.from(`${loggedInUserId}:${expiryTime}`).toString(
        "base64"
      );

      // Act
      const response = await request(app)
        .get("/users/recipients")
        .set("authtoken", token)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        data: [{ id: "user-456", name: "Other User" }],
      });

      // Verify that the logged-in user ID was passed to exclude them
      expect(mockUserRepository.findAllExceptUser).toHaveBeenCalledWith(
        loggedInUserId
      );

      // Verify that the logged-in user is not in the results
      const returnedUserIds = response.body.data.map((user: any) => user.id);
      expect(returnedUserIds).not.toContain(loggedInUserId);
    });
  });
});
