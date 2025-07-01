import { LoginUseCase } from "./login.use-case";
import { UserRepository } from "../../../domain/user.repository";
import { User } from "../../../domain/user.entity";
import { Email } from "../../../domain/value-objects/email";
import { Password } from "../../../domain/value-objects/password";

describe("LoginUseCase", () => {
  let loginUseCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let validEmail: Email;
  let validPassword: Password;
  let validUser: User;

  beforeEach(() => {
    const emailResult = Email.create("test@example.com");
    const passwordResult = Password.create("SecurePass1!");
    expect(emailResult.isSuccess).toBe(true);
    expect(passwordResult.isSuccess).toBe(true);
    validEmail = emailResult.getValue();
    validPassword = passwordResult.getValue();

    // Create a valid user
    const userResult = User.create({
      name: "Test User",
      email: validEmail,
      password: validPassword,
      isEmailVerified: true,
    });
    expect(userResult.isSuccess).toBe(true);
    validUser = userResult.getValue();

    // Mock repository
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      deleteAll: jest.fn(),
    };

    loginUseCase = new LoginUseCase(userRepository);
  });

  it("should successfully log in a user with valid credentials", async () => {
    // Arrange
    userRepository.findByEmail.mockResolvedValue(validUser);
    const loginDTO = {
      email: "test@example.com",
      password: "SecurePass1!",
    };

    // Act
    const result = await loginUseCase.execute(loginDTO);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDTO.email);
  });

  it("should fail when user does not exist", async () => {
    // Arrange
    userRepository.findByEmail.mockResolvedValue(null);
    const loginDTO = {
      email: "nonexistent@example.com",
      password: "SecurePass1!",
    };

    // Act
    const result = await loginUseCase.execute(loginDTO);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDTO.email);
  });

  it("should fail when password is incorrect", async () => {
    // Arrange
    userRepository.findByEmail.mockResolvedValue(validUser);
    const loginDTO = {
      email: "test@example.com",
      password: "WrongPass1!",
    };

    // Act
    const result = await loginUseCase.execute(loginDTO);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDTO.email);
  });
});
