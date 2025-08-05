import { PrismaClient } from "../../../../../shared/infrastructure/persistence/prisma/client";
import { AuthRepository } from "../../../domain/auth.repository";
import { User } from "../../../../user/domain/user.entity";
import { PrismaUserRepository } from "../../../../user/infrastructure/persistence/prisma/prisma-user.repository";

export class PrismaAuthRepository implements AuthRepository {
  private userRepository: PrismaUserRepository;

  constructor(private prisma: PrismaClient) {
    this.userRepository = new PrismaUserRepository(prisma);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async save(user: User): Promise<void> {
    return this.userRepository.save(user);
  }
}
