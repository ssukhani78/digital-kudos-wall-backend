import request from "supertest";
import { createApp } from "../../app";
import { UserRepository } from "../../modules/user/domain/user.repository";
import { EmailService } from "../../modules/user/domain/email.service";
import { RoleRepository } from "../../modules/user/domain/role.repository";
import { TokenGenerationService } from "../../modules/user/domain/token-generation.service";
import { KudosRepository } from "../../modules/kudos/domain/kudos.repository";
import { CategoryRepository } from "../../modules/category/domain/category.repository";
import { RegisterUseCase } from "../../modules/auth/application/use-cases/register/register.use-case";
import { LoginUseCase } from "../../modules/auth/application/use-cases/login/login.use-case";
import { GetRecipientsUseCase } from "../../modules/user/application/use-cases/get-recipients/get-recipients.use-case";
import { CreateKudosUseCase } from "../../modules/kudos/application/use-cases/create-kudos/create-kudos.use-case";
import { GetCategoriesUseCase } from "../../modules/category/application/use-cases/get-categories/get-categories.use-case";

describe("App Component Tests", () => {
  let mockUserRepository: UserRepository;
  let mockEmailService: EmailService;
  let mockRoleRepository: RoleRepository;
  let mockTokenGenerationService: TokenGenerationService;
  let mockKudosRepository: KudosRepository;
  let mockCategoryRepository: CategoryRepository;

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
      findById: jest.fn(),
    };

    mockTokenGenerationService = {
      generateToken: jest.fn(),
    };

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
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      // Reset mocks and setup for successful registration
      jest.clearAllMocks();
      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (mockUserRepository.save as jest.Mock).mockResolvedValue(undefined);
      (mockRoleRepository.findById as jest.Mock).mockResolvedValue(true);
      (mockEmailService.sendConfirmationEmail as jest.Mock).mockResolvedValue(undefined);

      const app = createApp({
        registerUseCase: new RegisterUseCase(
          mockUserRepository,
          mockEmailService,
          mockRoleRepository
        ),
        loginUseCase: new LoginUseCase(
          mockUserRepository,
          mockTokenGenerationService
        ),
        getRecipientsUseCase: new GetRecipientsUseCase(mockUserRepository),
        createKudosUseCase: new CreateKudosUseCase(
          mockKudosRepository,
          mockUserRepository,
          mockCategoryRepository
        ),
        getCategoriesUseCase: new GetCategoriesUseCase(mockCategoryRepository),
      });

      const response = await request(app).post("/auth/register").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        roleId: 1,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /auth/login", () => {
    it("should login user successfully", async () => {
      // Reset mocks and setup for successful login
      jest.clearAllMocks();
      const mockUser = {
        id: "user-123",
        email: { value: "john@example.com" },
        name: "John Doe",
        roleType: "TEAMLEAD",
        password: { compare: jest.fn().mockResolvedValue(true) },
      };
      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (mockTokenGenerationService.generateToken as jest.Mock).mockResolvedValue("mock-token");

      const app = createApp({
        registerUseCase: new RegisterUseCase(
          mockUserRepository,
          mockEmailService,
          mockRoleRepository
        ),
        loginUseCase: new LoginUseCase(
          mockUserRepository,
          mockTokenGenerationService
        ),
        getRecipientsUseCase: new GetRecipientsUseCase(mockUserRepository),
        createKudosUseCase: new CreateKudosUseCase(
          mockKudosRepository,
          mockUserRepository,
          mockCategoryRepository
        ),
        getCategoriesUseCase: new GetCategoriesUseCase(mockCategoryRepository),
      });

      const response = await request(app).post("/auth/login").send({
        email: "john@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
