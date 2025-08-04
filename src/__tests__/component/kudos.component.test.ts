import request from "supertest";
import { createApp } from "../../app";
import { CreateKudosUseCase } from "../../modules/kudos/application/use-cases/create-kudos/create-kudos.use-case";
import { GetCategoriesUseCase } from "../../modules/kudos/application/use-cases/get-categories/get-categories.use-case";
import { KudosRepository } from "../../modules/kudos/domain/kudos.repository";
import { CategoryRepository } from "../../modules/kudos/domain/category.repository";
import { UserRepository } from "../../modules/user/domain/user.repository";
import { RegisterUserUseCase } from "../../modules/user/application/use-cases/register-user/register-user.use-case";
import { LoginUseCase } from "../../modules/user/application/use-cases/login/login.use-case";
import { GetRecipientsUseCase } from "../../modules/user/application/use-cases/get-recipients/get-recipients.use-case";
import { EmailService } from "../../modules/user/domain/email.service";
import { RoleRepository } from "../../modules/user/domain/role.repository";
import { TokenGenerationService } from "../../modules/user/domain/token-generation.service";

describe("Kudos Component Tests", () => {
  let mockKudosRepository: KudosRepository;
  let mockCategoryRepository: CategoryRepository;
  let mockUserRepository: UserRepository;
  let mockEmailService: EmailService;
  let mockRoleRepository: RoleRepository;
  let mockTokenGenerationService: TokenGenerationService;

  beforeEach(() => {
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

  describe("GET /kudos/categories", () => {
    it("should return 200 with all categories", async () => {
      const getCategoriesUseCase = new GetCategoriesUseCase(
        mockCategoryRepository
      );
      const createKudosUseCase = new CreateKudosUseCase(
        mockKudosRepository,
        mockUserRepository,
        mockCategoryRepository
      );
      const registerUserUseCase = new RegisterUserUseCase(
        mockUserRepository,
        mockEmailService,
        mockRoleRepository
      );
      const loginUseCase = new LoginUseCase(
        mockUserRepository,
        mockTokenGenerationService
      );
      const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);

      const app = createApp({
        registerUserUseCase,
        loginUseCase,
        getRecipientsUseCase,
        createKudosUseCase,
        getCategoriesUseCase,
      });

      const mockCategories = [
        { id: 1, name: "Teamwork" },
        { id: 2, name: "Leadership" },
        { id: 3, name: "Innovation" },
      ];

      (mockCategoryRepository.findAll as jest.Mock).mockResolvedValue(
        mockCategories.map((cat) => ({
          id: { toString: () => cat.id.toString() },
          name: cat.name,
        }))
      );

      const response = await request(app).get("/kudos/categories").expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockCategories,
      });
      expect(mockCategoryRepository.findAll).toHaveBeenCalled();
    });

    it("should return 500 when categories cannot be fetched", async () => {
      const getCategoriesUseCase = new GetCategoriesUseCase(
        mockCategoryRepository
      );
      const createKudosUseCase = new CreateKudosUseCase(
        mockKudosRepository,
        mockUserRepository,
        mockCategoryRepository
      );
      const registerUserUseCase = new RegisterUserUseCase(
        mockUserRepository,
        mockEmailService,
        mockRoleRepository
      );
      const loginUseCase = new LoginUseCase(
        mockUserRepository,
        mockTokenGenerationService
      );
      const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);

      const app = createApp({
        registerUserUseCase,
        loginUseCase,
        getRecipientsUseCase,
        createKudosUseCase,
        getCategoriesUseCase,
      });

      (mockCategoryRepository.findAll as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/kudos/categories").expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Failed to fetch categories");
    });
  });

  describe("POST /kudos", () => {
    it("should return 201 when kudos is successfully created", async () => {
      const getCategoriesUseCase = new GetCategoriesUseCase(
        mockCategoryRepository
      );
      const createKudosUseCase = new CreateKudosUseCase(
        mockKudosRepository,
        mockUserRepository,
        mockCategoryRepository
      );
      const registerUserUseCase = new RegisterUserUseCase(
        mockUserRepository,
        mockEmailService,
        mockRoleRepository
      );
      const loginUseCase = new LoginUseCase(
        mockUserRepository,
        mockTokenGenerationService
      );
      const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);

      const app = createApp({
        registerUserUseCase,
        loginUseCase,
        getRecipientsUseCase,
        createKudosUseCase,
        getCategoriesUseCase,
      });

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

      // Mock sender
      (mockUserRepository.findById as jest.Mock)
        .mockResolvedValueOnce({
          id: senderId,
          name: "John Doe",
        })
        .mockResolvedValueOnce({
          id: recipientId,
          name: "Jane Smith",
        });

      // Mock kudos creation
      (mockKudosRepository.create as jest.Mock).mockResolvedValue(undefined);

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
        id: expect.any(Number),
        senderName: "John Doe",
        receiverName: "Jane Smith",
        categoryName: "Teamwork",
        message,
      });
      expect(mockKudosRepository.create).toHaveBeenCalled();
    });

    it("should return 401 when no authorization header is provided", async () => {
      const getCategoriesUseCase = new GetCategoriesUseCase(
        mockCategoryRepository
      );
      const createKudosUseCase = new CreateKudosUseCase(
        mockKudosRepository,
        mockUserRepository,
        mockCategoryRepository
      );
      const registerUserUseCase = new RegisterUserUseCase(
        mockUserRepository,
        mockEmailService,
        mockRoleRepository
      );
      const loginUseCase = new LoginUseCase(
        mockUserRepository,
        mockTokenGenerationService
      );
      const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);

      const app = createApp({
        registerUserUseCase,
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
      expect(response.body.message).toBe("authToken in headers is required");
    });

    it("should return 400 when message is too short", async () => {
      const getCategoriesUseCase = new GetCategoriesUseCase(
        mockCategoryRepository
      );
      const createKudosUseCase = new CreateKudosUseCase(
        mockKudosRepository,
        mockUserRepository,
        mockCategoryRepository
      );
      const registerUserUseCase = new RegisterUserUseCase(
        mockUserRepository,
        mockEmailService,
        mockRoleRepository
      );
      const loginUseCase = new LoginUseCase(
        mockUserRepository,
        mockTokenGenerationService
      );
      const getRecipientsUseCase = new GetRecipientsUseCase(mockUserRepository);

      const app = createApp({
        registerUserUseCase,
        loginUseCase,
        getRecipientsUseCase,
        createKudosUseCase,
        getCategoriesUseCase,
      });

      const senderId = "sender-uuid";
      const expiryTime = Date.now() + 3600000; // 1 hour from now
      const tokenData = `${senderId}:${expiryTime}`;
      const token = Buffer.from(tokenData).toString("base64");

      const requestBody = {
        recipientId: "recipient-uuid",
        message: "Too short",
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
  });
});
