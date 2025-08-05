import { LoginUseCase } from "./login.use-case";
import { UserRepository } from "../../../../user/domain/user.repository";
import { Email } from "../../../../user/domain/value-objects/email";
import { Password } from "../../../../user/domain/value-objects/password";
import { TokenGenerationService } from "../../../../user/domain/token-generation.service";
import { User } from "../../../../user/domain/user.entity";

describe("LoginUseCase", () => {
  let loginUseCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenGenerationService: jest.Mocked<TokenGenerationService>;
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
      roleId: 1, // TEAMLEAD role
    });
    expect(userResult.isSuccess).toBe(true);
    validUser = userResult.getValue();

    // Mock repository
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      deleteAll: jest.fn(),
      findAllExceptUser: jest.fn(),
    };

    // Mock token generation service
    tokenGenerationService = {
      generateToken: jest.fn().mockReturnValue("mock-token-123"),
    };

    loginUseCase = new LoginUseCase(userRepository, tokenGenerationService);
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
    expect(tokenGenerationService.generateToken).toHaveBeenCalledWith(
      validUser.id.toString()
    );
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
