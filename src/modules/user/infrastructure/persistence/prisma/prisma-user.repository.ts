import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../../../domain/user.repository";
import { User } from "../../../domain/user.entity";
import { UserMapper } from "./mappers/user.mapper";

export class PrismaUserRepository implements UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findByEmail(emailValue: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email: emailValue },
    });

    if (!prismaUser) {
      return null;
    }

    return UserMapper.toDomain(prismaUser);
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);

    await this.prisma.user.upsert({
      where: { id: user.id.toString() },
      update: data,
      create: data,
    });
  }
}
