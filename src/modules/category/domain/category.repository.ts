import { Category } from "./category.entity";

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: number): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
}
