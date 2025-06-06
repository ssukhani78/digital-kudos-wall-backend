import { RegisterUserUseCase } from "../register-user.use-case";
import { UserRepository } from "../../domain/user.repository";
import { EmailService } from "../../domain/email.service";
import { User } from "../../domain/user.entity";
import { UserAlreadyExistsError } from "../../domain/errors/user-already-exists.error";
import { UserBuilder } from "../../infrastructure/persistence/prisma/__tests__/user.builder";

describe("RegisterUserUseCase (Sociable Unit Test)", () => {
  let useCase: RegisterUserUseCase;
  let userRepository: UserRepository;
  let emailService: EmailService;
  let userBuilder: UserBuilder;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    };

    emailService = {
      sendConfirmationEmail: jest.fn(),
    };

    useCase = new RegisterUserUseCase(userRepository, emailService);
    userBuilder = new UserBuilder();
  });

  describe("execute", () => {
    it("should successfully register a new user", async () => {
      const email = "test@example.com";
      const password = "ValidPass123!";

      userRepository.findByEmail = jest.fn().mockResolvedValue(null);
      userRepository.save = jest.fn().mockImplementation((user: User) => Promise.resolve(user));
      emailService.sendConfirmationEmail = jest.fn().mockResolvedValue(undefined);

      const result = await useCase.execute({ email, password });

      expect(result.isSuccess).toBe(true);
      expect(userRepository.save).toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).toHaveBeenCalledWith(email);

      const savedUser = (userRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedUser).toBeInstanceOf(User);
      expect(savedUser.email.value).toBe(email);
    });

    it("should return error when user already exists", async () => {
      const email = "existing@example.com";
      const password = "ValidPass123!";

      const existingUser = userBuilder.withEmail(email).withPassword(password).build();

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(existingUser);

      const result = await useCase.execute({ email, password });

      expect(result.isFailure).toBe(true);
      expect(result.error()).toBeInstanceOf(UserAlreadyExistsError);
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });

    it("should validate email format", async () => {
      const invalidEmail = "invalid.email";
      const password = "ValidPass123!";

      const result = await useCase.execute({ email: invalidEmail, password });

      expect(result.isFailure).toBe(true);
      expect(result.error()).toContain("Invalid email format");
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });

    it("should validate password requirements", async () => {
      const email = "test@example.com";
      const invalidPassword = "weak";

      const result = await useCase.execute({ email, password: invalidPassword });

      expect(result.isFailure).toBe(true);
      expect(result.error()).toContain("Password must");
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });
  });
});
