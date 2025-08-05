import request from "supertest";
import { createApp } from "../../app";
import { GetCategoriesUseCase } from "../../modules/category/application/use-cases/get-categories/get-categories.use-case";
import { CategoryRepository } from "../../modules/category/domain/category.repository";
import { RegisterUseCase } from "../../modules/auth/application/use-cases/register/register.use-case";
import { LoginUseCase } from "../../modules/auth/application/use-cases/login/login.use-case";
import { GetRecipientsUseCase } from "../../modules/user/application/use-cases/get-recipients/get-recipients.use-case";
import { CreateKudosUseCase } from "../../modules/kudos/application/use-cases/create-kudos/create-kudos.use-case";
import { UserRepository } from "../../modules/user/domain/user.repository";
import { KudosRepository } from "../../modules/kudos/domain/kudos.repository";
import { EmailService } from "../../modules/user/domain/email.service";
import { RoleRepository } from "../../modules/user/domain/role.repository";
import { TokenGenerationService } from "../../modules/user/domain/token-generation.service";

describe("Category Component Tests", () => {
  let mockCategoryRepository: CategoryRepository;
  let mockUserRepository: UserRepository;
  let mockKudosRepository: KudosRepository;
  let mockEmailService: EmailService;
  let mockRoleRepository: RoleRepository;
  let mockTokenGenerationService: TokenGenerationService;

  beforeEach(() => {
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

    mockKudosRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySenderId: jest.fn(),
      findByRecipientId: jest.fn(),
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

  describe("GET /categories", () => {
    it("should return 200 with all categories", async () => {
      const getCategoriesUseCase = new GetCategoriesUseCase(
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
      const createKudosUseCase = new CreateKudosUseCase(
        mockKudosRepository,
        mockUserRepository,
        mockCategoryRepository
      );

      const app = createApp({
        registerUseCase,
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

      // Create a valid token for authentication
      const userId = "test-user-id";
      const expiryTime = Date.now() + 3600000; // 1 hour from now
      const tokenData = `${userId}:${expiryTime}`;
      const token = Buffer.from(tokenData).toString("base64");

      const response = await request(app)
        .get("/categories")
        .set("authtoken", token)
        .expect(200);

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
      const createKudosUseCase = new CreateKudosUseCase(
        mockKudosRepository,
        mockUserRepository,
        mockCategoryRepository
      );

      const app = createApp({
        registerUseCase,
        loginUseCase,
        getRecipientsUseCase,
        createKudosUseCase,
        getCategoriesUseCase,
      });

      (mockCategoryRepository.findAll as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      // Create a valid token for authentication
      const userId = "test-user-id";
      const expiryTime = Date.now() + 3600000; // 1 hour from now
      const tokenData = `${userId}:${expiryTime}`;
      const token = Buffer.from(tokenData).toString("base64");

      const response = await request(app)
        .get("/categories")
        .set("authtoken", token)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Failed to fetch categories");
    });
  });
});
