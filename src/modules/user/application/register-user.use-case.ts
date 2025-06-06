import { UseCase } from "../../../shared/core/use-case";
import { Result } from "../../../shared/core/result";
import { User } from "../domain/user.entity";
import { UserRepository } from "../domain/user.repository";
import { EmailService } from "../domain/email.service";
import { Email } from "../domain/value-objects/email";
import { Password } from "../domain/value-objects/password";
import { UserAlreadyExistsError } from "../domain/errors/user-already-exists.error";

export interface RegisterUserDTO {
  email: string;
  password: string;
}

export type RegisterUserResponse = Result<User, string | UserAlreadyExistsError>;

export class RegisterUserUseCase implements UseCase<RegisterUserDTO, RegisterUserResponse> {
  constructor(private readonly userRepository: UserRepository, private readonly emailService: EmailService) {}

  async execute(request: RegisterUserDTO): Promise<RegisterUserResponse> {
    if (!request.email || !request.password) {
      return Result.fail("Email and password are required.");
    }

    const emailOrError = Email.create(request.email);
    const passwordOrError = Password.create(request.password);

    if (emailOrError.isFailure) {
      return Result.fail(emailOrError.error());
    }

    if (passwordOrError.isFailure) {
      return Result.fail(passwordOrError.error());
    }

    const email = emailOrError.getValue();
    const password = passwordOrError.getValue();

    const existingUser = await this.userRepository.findByEmail(email.value);

    if (existingUser) {
      return Result.fail(new UserAlreadyExistsError());
    }

    const userOrError = User.create({
      email,
      password,
      isEmailVerified: false,
    });

    if (userOrError.isFailure) {
      return Result.fail(userOrError.error());
    }

    const user = userOrError.getValue();

    await this.userRepository.save(user);
    await this.emailService.sendConfirmationEmail(email.value);

    return Result.ok<User>(user);
  }
}
