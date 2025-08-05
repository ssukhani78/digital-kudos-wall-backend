import { UseCase } from "../../../../../shared/core/use-case";
import { Result } from "../../../../../shared/core/result";
import { User } from "../../../../user/domain/user.entity";
import { Email } from "../../../../user/domain/value-objects/email";
import { Password } from "../../../../user/domain/value-objects/password";
import { AuthRepository } from "../../../domain/auth.repository";
import { EmailService } from "../../../../user/domain/email.service";
import { RoleRepository } from "../../../../user/domain/role.repository";
import { UserAlreadyExistsError } from "../../../../user/domain/errors/user-already-exists.error";

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  roleId: number;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
}

type RegisterResult = Result<RegisterResponse, string>;

export class RegisterUseCase implements UseCase<RegisterDTO, RegisterResult> {
  constructor(
    private authRepository: AuthRepository,
    private emailService: EmailService,
    private roleRepository: RoleRepository
  ) {}

  async execute(request: RegisterDTO): Promise<RegisterResult> {
    try {
      // Validate email format
      const emailOrError = Email.create(request.email);
      if (emailOrError.isFailure) {
        return Result.fail<RegisterResponse, string>(emailOrError.error());
      }

      // Validate password strength
      const passwordOrError = Password.create(request.password);
      if (passwordOrError.isFailure) {
        return Result.fail<RegisterResponse, string>(passwordOrError.error());
      }

      // Check if user already exists
      const existingUser = await this.authRepository.findByEmail(request.email);
      if (existingUser) {
        return Result.fail<RegisterResponse, string>(
          "User with this email already exists"
        );
      }

      // Validate role exists
      const roleExists = await this.roleRepository.findById(request.roleId);
      if (!roleExists) {
        return Result.fail<RegisterResponse, string>("Invalid role");
      }

      // Create user
      const userOrError = User.create({
        email: emailOrError.getValue(),
        password: passwordOrError.getValue(),
        name: request.name,
        roleId: request.roleId,
        isEmailVerified: false,
      });

      if (userOrError.isFailure) {
        return Result.fail<RegisterResponse, string>(userOrError.error());
      }

      const user = userOrError.getValue();

      // Save user
      await this.authRepository.save(user);

      // Send confirmation email
      await this.emailService.sendConfirmationEmail(request.email);

      return Result.ok<RegisterResponse>({
        id: user.id.toString(),
        name: user.name,
        email: user.email.value,
      });
    } catch (error) {
      return Result.fail<RegisterResponse, string>(error as string);
    }
  }
}
