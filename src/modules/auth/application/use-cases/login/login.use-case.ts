import { UseCase } from "../../../../../shared/core/use-case";
import { Result } from "../../../../../shared/core/result";
import { AuthRepository } from "../../../domain/auth.repository";
import { TokenGenerationService } from "../../../../user/domain/token-generation.service";
import { InvalidCredentialsError } from "../../../../user/domain/errors/invalid-credentials.error";
import { Password } from "../../../../user/domain/value-objects/password";

interface LoginDTO {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    isTeamLead: boolean;
  };
}

type LoginResult = Result<LoginResponse, string>;

export class LoginUseCase implements UseCase<LoginDTO, LoginResult> {
  constructor(
    private authRepository: AuthRepository,
    private tokenGenerationService: TokenGenerationService
  ) {}

  async execute(request: LoginDTO): Promise<LoginResult> {
    try {
      // Find user by email
      const user = await this.authRepository.findByEmail(request.email);
      if (!user) {
        return Result.fail<LoginResponse, string>("Invalid email or password");
      }

      // Validate password
      const passwordOrError = Password.create(request.password);
      if (passwordOrError.isFailure) {
        return Result.fail<LoginResponse, string>("Invalid email or password");
      }

      const isPasswordValid = await user.password.comparePassword(
        request.password
      );
      if (!isPasswordValid) {
        return Result.fail<LoginResponse, string>("Invalid email or password");
      }

      // Generate token
      const token = this.tokenGenerationService.generateToken(
        user.id.toString()
      );

      return Result.ok<LoginResponse>({
        token,
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email.value,
          isTeamLead: user.roleType === "TEAMLEAD",
        },
      });
    } catch (error) {
      return Result.fail<LoginResponse, string>("Failed to login");
    }
  }
}
