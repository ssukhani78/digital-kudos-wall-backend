import { UserRepository } from "../../user/domain/user.repository";
import { User } from "../../user/domain/user.entity";
import { RegisterUserDTO } from "../../user/application/register-user.use-case";
import { Email } from "../../user/domain/value-objects/email";
import { Password } from "../../user/domain/value-objects/password";

export class CreateTestUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(payload: RegisterUserDTO): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(payload.email);
    if (existingUser) {
      return existingUser;
    }

    const emailOrError = Email.create(payload.email);
    const passwordOrError = Password.create(payload.password);
    const userOrError = User.create({
      name: payload.name,
      email: emailOrError.getValue(),
      password: passwordOrError.getValue(),
      isEmailVerified: true, // For tests, we can assume the user is verified
    });

    if (userOrError.isFailure) {
      throw new Error(userOrError.error());
    }

    const user = userOrError.getValue();
    await this.userRepository.save(user);
    return user;
  }
}
