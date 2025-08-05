import request from "supertest";
import { createApp } from "../../app";
import { UserRepository } from "../../modules/user/domain/user.repository";
import { EmailService } from "../../modules/user/domain/email.service";
import { RoleRepository } from "../../modules/user/domain/role.repository";
import { RegisterUseCase } from "../../modules/auth/application/use-cases/register/register.use-case";
import { TokenGenerationService } from "../../modules/user/domain/token-generation.service";
import { LoginUseCase } from "../../modules/auth/application/use-cases/login/login.use-case";
import { GetRecipientsUseCase } from "../../modules/user/application/use-cases/get-recipients/get-recipients.use-case";
import { CreateKudosUseCase } from "../../modules/kudos/application/use-cases/create-kudos/create-kudos.use-case";
import { GetCategoriesUseCase } from "../../modules/category/application/use-cases/get-categories/get-categories.use-case";
import { KudosRepository } from "../../modules/kudos/domain/kudos.repository";
import { CategoryRepository } from "../../modules/category/domain/category.repository";

describe("User Component Tests", () => {
  let mockUserRepository: UserRepository;
  let mockEmailService: EmailService;
  let mockRoleRepository: RoleRepository;
  let mockTokenGenerationService: TokenGenerationService;
  let mockKudosRepository: KudosRepository;
  let mockCategoryRepository: CategoryRepository;
  let mockGetRecipientsUseCase: GetRecipientsUseCase;
  let mockCreateKudosUseCase: CreateKudosUseCase;

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

    mockKudosRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByRecipientId: jest.fn(),
      findBySenderId: jest.fn(),
    };

    mockCategoryRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
    };

    mockGetRecipientsUseCase = {
      execute: jest.fn(),
    } as unknown as GetRecipientsUseCase;

    mockCreateKudosUseCase = {
      execute: jest.fn(),
    } as unknown as CreateKudosUseCase;
  });

  describe("POST /users/register", () => {
    it("should return 201 when user is successfully registered", async () => {
      const registerUseCase = new RegisterUseCase(
        mockUserRepository,
        mockEmailService,
        mockRoleRepository
      );
      const app = createApp({
        registerUseCase,
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

      const requestBody = {
        name: "Test User",
        email: "test@example.com",
        password: "ValidPassword123!",
        roleId: 1,
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (mockUserRepository.save as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/auth/register")
        .send(requestBody)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        id: expect.any(String),
        name: requestBody.name,
        email: requestBody.email,
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledWith(
        requestBody.email
      );
    });

    it("should return 409 Conflict when user already exists", async () => {
      const registerUseCase = new RegisterUseCase(
        mockUserRepository,
        mockEmailService,
        mockRoleRepository
      );
      const app = createApp({
        registerUseCase,
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

      const requestBody = {
        name: "Existing User",
        email: "existing@example.com",
        password: "ValidPassword123!",
        roleId: 1,
      };

      // Reset mocks and set up for existing user scenario
      jest.clearAllMocks();
      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue({
        id: "any-id",
      });

      const response = await request(app)
        .post("/auth/register")
        .send(requestBody)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "User with this email already exists"
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });

    it("should return 400 Bad Request for invalid input (e.g., weak password)", async () => {
      const registerUseCase = new RegisterUseCase(
        mockUserRepository,
        mockEmailService,
        mockRoleRepository
      );
      const app = createApp({
        registerUseCase,
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

      const requestBody = {
        name: "Test User",
        email: "test@example.com",
        password: "weak",
        roleId: 1,
      };

      // Reset mocks and set up for invalid input scenario
      jest.clearAllMocks();
      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/auth/register")
        .send(requestBody)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Password must be at least 8 characters long"
      );
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });
  });
});
