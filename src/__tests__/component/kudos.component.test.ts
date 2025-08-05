import request from "supertest";
import { createApp } from "../../app";
import { CreateKudosUseCase } from "../../modules/kudos/application/use-cases/create-kudos/create-kudos.use-case";
import { KudosRepository } from "../../modules/kudos/domain/kudos.repository";
import { UserRepository } from "../../modules/user/domain/user.repository";
import { CategoryRepository } from "../../modules/category/domain/category.repository";
import { RegisterUseCase } from "../../modules/auth/application/use-cases/register/register.use-case";
import { LoginUseCase } from "../../modules/auth/application/use-cases/login/login.use-case";
import { GetRecipientsUseCase } from "../../modules/user/application/use-cases/get-recipients/get-recipients.use-case";
import { GetCategoriesUseCase } from "../../modules/category/application/use-cases/get-categories/get-categories.use-case";
import { EmailService } from "../../modules/user/domain/email.service";
import { RoleRepository } from "../../modules/user/domain/role.repository";
import { TokenGenerationService } from "../../modules/user/domain/token-generation.service";
import { Application } from "express";

describe("Kudos Component Tests", () => {
  let mockKudosRepository: KudosRepository;
  let mockCategoryRepository: CategoryRepository;
  let mockUserRepository: UserRepository;
  let mockEmailService: EmailService;
  let mockRoleRepository: RoleRepository;
  let mockTokenGenerationService: TokenGenerationService;
  let app: Application;

  beforeEach(() => {
    // Reset all mocks to ensure clean state between tests

    mockKudosRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySenderId: jest.fn(),
      findByRecipientId: jest.fn(),
    };

    mockCategoryRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
    };

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 201 when kudos is successfully created", async () => {
    const senderId = "sender-uuid";
    const recipientId = "recipient-uuid";
    const categoryId = 1;
    const message =
      "Great work on the project! Keep up the excellent collaboration.";

    // Mock category
    (mockCategoryRepository.findById as jest.Mock).mockResolvedValue({
      id: { toString: () => categoryId.toString() },
      name: "Teamwork",
    });

    // Mock sender (must be a team lead)
    (mockUserRepository.findById as jest.Mock)
      .mockResolvedValueOnce({
        id: senderId,
        name: "John Doe",
        roleType: "TEAMLEAD",
      })
      .mockResolvedValueOnce({
        id: recipientId,
        name: "Jane Smith",
        roleType: "MEMBER",
      });

    // Mock kudos creation
    (mockKudosRepository.create as jest.Mock).mockResolvedValue(undefined);

    const createKudosUseCase = new CreateKudosUseCase(
      mockKudosRepository,
      mockUserRepository,
      mockCategoryRepository
    );
    const registerUseCase = new RegisterUseCase(
      mockUserRepository,
      mockEmailService,
      mockRoleRepository
    );
    const loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockTokenGenerationService
    );
    const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);
    const getCategoriesUseCase = new GetCategoriesUseCase(
      mockCategoryRepository
    );

    app = createApp({
      registerUseCase,
      loginUseCase,
      getRecipientsUseCase,
      createKudosUseCase,
      getCategoriesUseCase,
    });

    // Create token in the format expected by token-validation.middleware.ts
    // Format: base64(userId:expiryTime)
    const expiryTime = Date.now() + 3600000; // 1 hour from now
    const tokenData = `${senderId}:${expiryTime}`;
    const token = Buffer.from(tokenData).toString("base64");

    const requestBody = {
      recipientId,
      message,
      categoryId,
    };

    const response = await request(app)
      .post("/kudos")
      .set("authtoken", token)
      .send(requestBody)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      id: expect.any(String),
      senderName: "John Doe",
      receiverName: "Jane Smith",
      categoryName: "Teamwork",
      message,
      createdAt: expect.any(String),
    });
    expect(mockKudosRepository.create).toHaveBeenCalled();
  });

  it("should return 400 when message is too short", async () => {
    const senderId = "sender-uuid";
    const recipientId = "recipient-uuid";
    const categoryId = 1;
    const message = "Too short";
    // Setup mocks BEFORE creating use cases
    (mockCategoryRepository.findById as jest.Mock).mockResolvedValue({
      id: { toString: () => categoryId.toString() },
      name: "Teamwork",
    });
    (mockUserRepository.findById as jest.Mock)
      .mockResolvedValueOnce({
        id: senderId,
        name: "John Doe",
        roleType: "TEAMLEAD",
      })
      .mockResolvedValueOnce({
        id: recipientId,
        name: "Jane Smith",
        roleType: "MEMBER",
      });

    const createKudosUseCase = new CreateKudosUseCase(
      mockKudosRepository,
      mockUserRepository,
      mockCategoryRepository
    );
    const registerUseCase = new RegisterUseCase(
      mockUserRepository,
      mockEmailService,
      mockRoleRepository
    );
    const loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockTokenGenerationService
    );
    const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);
    const getCategoriesUseCase = new GetCategoriesUseCase(
      mockCategoryRepository
    );

    app = createApp({
      registerUseCase,
      loginUseCase,
      getRecipientsUseCase,
      createKudosUseCase,
      getCategoriesUseCase,
    });

    const expiryTime = Date.now() + 3600000; // 1 hour from now
    const tokenData = `${senderId}:${expiryTime}`;
    const token = Buffer.from(tokenData).toString("base64");

    const requestBody = {
      recipientId: recipientId,
      message: message,
      categoryId: 1,
    };

    const response = await request(app)
      .post("/kudos")
      .set("authtoken", token)
      .send(requestBody)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Message must be at least 20 characters long"
    );
  });

  it("should return 401 when no authorization header is provided", async () => {
    const createKudosUseCase = new CreateKudosUseCase(
      mockKudosRepository,
      mockUserRepository,
      mockCategoryRepository
    );
    const registerUseCase = new RegisterUseCase(
      mockUserRepository,
      mockEmailService,
      mockRoleRepository
    );
    const loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockTokenGenerationService
    );
    const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);
    const getCategoriesUseCase = new GetCategoriesUseCase(
      mockCategoryRepository
    );

    app = createApp({
      registerUseCase,
      loginUseCase,
      getRecipientsUseCase,
      createKudosUseCase,
      getCategoriesUseCase,
    });

    const requestBody = {
      recipientId: "recipient-uuid",
      message: "Great work!",
      categoryId: 1,
    };

    const response = await request(app)
      .post("/kudos")
      .send(requestBody)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Authorization header missing or invalid"
    );
  });
});
