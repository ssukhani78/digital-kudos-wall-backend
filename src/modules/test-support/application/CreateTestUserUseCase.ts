import { UserRepository } from "../../user/domain/user.repository";
import { User } from "../../user/domain/user.entity";
import { Email } from "../../user/domain/value-objects/email";
import { Password } from "../../user/domain/value-objects/password";
import { RoleId } from "../../user/domain/value-objects/role-id";
import { RegisterDTO } from "../../auth/application/use-cases/register/register.use-case";

export class CreateTestUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(payload: RegisterDTO): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(payload.email);
    if (existingUser) {
      return existingUser;
    }
    payload.roleId = Number(payload.roleId);

    const emailOrError = Email.create(payload.email);
    const passwordOrError = Password.create(payload.password);
    const roleIdOrError = RoleId.create(payload.roleId);
    const userOrError = User.create({
      name: payload.name,
      email: emailOrError.getValue(),
      password: passwordOrError.getValue(),
      isEmailVerified: true, // For tests, we can assume the user is verified
      roleId: roleIdOrError.getValue().value,
    });

    if (userOrError.isFailure) {
      throw new Error(userOrError.error());
    }

    const user = userOrError.getValue();
    await this.userRepository.save(user);
    return user;
  }
}
