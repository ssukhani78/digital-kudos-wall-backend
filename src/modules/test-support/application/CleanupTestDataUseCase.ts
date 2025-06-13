import { UserRepository } from "../../user/domain/user.repository";

export class CleanupTestDataUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<void> {
    // In a more sophisticated setup, you might want to:
    // 1. Only delete users created during tests (e.g., with a test flag)
    // 2. Clean up other entities (kudos, etc.)
    // 3. Reset sequences/auto-increment values

    await this.userRepository.deleteAll();
  }
}
