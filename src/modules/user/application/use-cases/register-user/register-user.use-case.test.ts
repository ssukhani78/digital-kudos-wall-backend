import { RegisterUserUseCase } from "./register-user.use-case";
import { UserRepository } from "../../../domain/user.repository";
import { EmailService } from "../../../domain/email.service";
import { UserAlreadyExistsError } from "../../../domain/errors/user-already-exists.error";
import { UserBuilder } from "../../../infrastructure/persistence/prisma/__tests__/user.builder";
import { RoleRepository } from "../../../domain/role.repository";

describe("RegisterUserUseCase (Sociable Unit Test)", () => {
  let useCase: RegisterUserUseCase;
  let userRepository: UserRepository;
  let emailService: EmailService;
  let userBuilder: UserBuilder;
  let roleRepository: RoleRepository;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      deleteAll: jest.fn(),
    };

    emailService = {
      sendConfirmationEmail: jest.fn(),
    };

    // Default: all roles exist
    roleRepository = {
      findById: jest.fn().mockResolvedValue(true),
    };

    useCase = new RegisterUserUseCase(
      userRepository,
      emailService,
      roleRepository
    );
    userBuilder = new UserBuilder();
  });

  describe("execute", () => {
    it("should successfully register a new user when valid input is provided", async () => {
      const registerUserDTO = {
        email: "test@example.com",
        password: "ValidPassword123!",
        name: "Test User",
        roleId: 1,
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.save as jest.Mock).mockImplementation(() =>
        Promise.resolve()
      );
      (emailService.sendConfirmationEmail as jest.Mock).mockResolvedValue(
        undefined
      );

      const result = await useCase.execute(registerUserDTO);

      expect(result.isSuccess).toBe(true);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        registerUserDTO.email
      );
      expect(userRepository.save).toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).toHaveBeenCalledWith(
        registerUserDTO.email
      );
    });

    it("should return error when user already exists", async () => {
      const email = "existing@example.com";
      const password = "ValidPassword123!";
      const name = "Existing User";

      const existingUser = userBuilder
        .withName(name)
        .withEmail(email)
        .withPassword(password)
        .build();
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(existingUser);

      const result = await useCase.execute({
        name,
        email,
        password,
        roleId: 1,
      });

      expect(result.isFailure).toBe(true);
      expect(result.error()).toBeInstanceOf(UserAlreadyExistsError);
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });

    it("should validate email format", async () => {
      const email = "invalid-email";
      const password = "ValidPassword123!";
      const name = "Test User";

      const result = await useCase.execute({
        name,
        email,
        password,
        roleId: 1,
      });

      expect(result.isFailure).toBe(true);
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });

    it("should validate password requirements", async () => {
      const email = "test@example.com";
      const password = "weak";
      const name = "Test User";

      const result = await useCase.execute({
        name,
        email,
        password,
        roleId: 1,
      });

      expect(result.isFailure).toBe(true);
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });

    it("should register a user with the specified roleId", async () => {
      const registerUserDTO = {
        email: "roleuser@example.com",
        password: "ValidPassword123!",
        name: "Role User",
        roleId: 2, // MEMBER
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.save as jest.Mock).mockImplementation((user) =>
        Promise.resolve(user)
      );
      (emailService.sendConfirmationEmail as jest.Mock).mockResolvedValue(
        undefined
      );

      const result = await useCase.execute(registerUserDTO);

      expect(result.isSuccess).toBe(true);
      // Check that the saved user has the correct roleId
      const savedUser = (userRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedUser.props.roleId).toBe(2);
    });

    it("should return error when roleId does not exist in the roles table", async () => {
      const registerUserDTO = {
        email: "norole@example.com",
        password: "ValidPassword123!",
        name: "No Role",
        roleId: 999, // Non-existent role
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (roleRepository.findById as jest.Mock).mockResolvedValue(false);

      const result = await useCase.execute(registerUserDTO);

      expect(result.isFailure).toBe(true);
      const error = result.error();
      const errorMessage = typeof error === "string" ? error : error.message;
      expect(errorMessage).toMatch(/role.*not exist/i);
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });
  });
});
