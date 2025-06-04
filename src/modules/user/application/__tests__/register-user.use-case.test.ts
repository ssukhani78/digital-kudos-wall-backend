import { RegisterUserUseCase } from "../register-user.use-case";
import { UserRepository } from "../../domain/user.repository";
import { EmailService } from "../../domain/email.service";
import { User } from "../../domain/user.entity";
import { Email } from "../../domain/value-objects/email";
import { Password } from "../../domain/value-objects/password";
import { UserAlreadyExistsError } from "../../domain/errors/user-already-exists.error";

describe("RegisterUserUseCase", () => {
  let useCase: RegisterUserUseCase;
  let userRepository: UserRepository;
  let emailService: EmailService;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    emailService = {
      sendConfirmationEmail: jest.fn(),
    };

    useCase = new RegisterUserUseCase(userRepository, emailService);
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

      const existingUser = User.create({
        email: Email.create(email).getValue(),
        password: Password.create(password).getValue(),
      }).getValue();

      userRepository.findByEmail = jest.fn().mockResolvedValue(existingUser);

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
