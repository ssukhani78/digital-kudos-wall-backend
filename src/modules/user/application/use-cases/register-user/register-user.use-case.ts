import { UseCase } from "../../../../../shared/core/use-case";
import { Result } from "../../../../../shared/core/result";
import { User } from "../../../domain/user.entity";
import { UserRepository } from "../../../domain/user.repository";
import { EmailService } from "../../../domain/email.service";
import { Email } from "../../../domain/value-objects/email";
import { Password } from "../../../domain/value-objects/password";
import { RoleId } from "../../../domain/value-objects/role-id";
import { UserAlreadyExistsError } from "../../../domain/errors/user-already-exists.error";
import { ValidationError } from "../../../domain/errors/validation.error";
import { RoleRepository } from "../../../domain/role.repository";

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
  roleId: number;
}

export type RegisterUserResponse = Result<
  User,
  string | UserAlreadyExistsError | ValidationError
>;

export class RegisterUserUseCase
  implements UseCase<RegisterUserDTO, RegisterUserResponse>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly roleRepository: RoleRepository
  ) {}

  async execute(request: RegisterUserDTO): Promise<RegisterUserResponse> {
    if (!request.name) {
      return Result.fail(new ValidationError("Name is required."));
    }

    request.roleId = Number(request.roleId)
    const emailOrError = Email.create(request.email);
    const passwordOrError = Password.create(request.password);
    const roleIdOrError = RoleId.create(request.roleId);

    if (emailOrError.isFailure) {
      return Result.fail(new ValidationError(emailOrError.error()));
    }

    if (passwordOrError.isFailure) {
      return Result.fail(new ValidationError(passwordOrError.error()));
    }

    if (roleIdOrError.isFailure) {
      return Result.fail(new ValidationError(roleIdOrError.error()));
    }

    const email = emailOrError.getValue();
    const password = passwordOrError.getValue();
    const roleId = roleIdOrError.getValue().value;

    const existingUser = await this.userRepository.findByEmail(email.value);

    if (existingUser) {
      return Result.fail(new UserAlreadyExistsError());
    }

    const roleExists = await this.roleRepository.findById(roleId);
    if (!roleExists) {
      return Result.fail(new ValidationError("Role does not exist."));
    }

    const userOrError = User.create({
      name: request.name,
      email,
      password,
      isEmailVerified: false,
      roleId
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
