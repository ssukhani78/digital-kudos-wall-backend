import { PrismaClient } from "../../../../../shared/infrastructure/persistence/prisma/client";
import { CategoryRepository } from "../../../domain/category.repository";
import { Category } from "../../../domain/category.entity";
import { UniqueEntityID } from "../../../../../shared/domain/unique-entity-id";

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return categories.map((category) =>
      Category.create(
        {
          name: category.name,
        },
        new UniqueEntityID(category.id.toString())
      ).getValue()
    );
  }

  async findById(id: number): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return null;
    }

    return Category.create(
      {
        name: category.name,
      },
      new UniqueEntityID(category.id.toString())
    ).getValue();
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { name },
    });

    if (!category) {
      return null;
    }

    return Category.create(
      {
        name: category.name,
      },
      new UniqueEntityID(category.id.toString())
    ).getValue();
  }
}
