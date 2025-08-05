import { PrismaClient } from "../../../../../shared/infrastructure/persistence/prisma/client";
import { RoleRepository } from "../../../domain/role.repository";

export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<boolean> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    return !!role;
  }
}
