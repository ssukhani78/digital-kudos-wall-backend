import { UseCase } from "../../../../../shared/core/use-case";
import { Result } from "../../../../../shared/core/result";
import { Category } from "../../../domain/category.entity";
import { CategoryRepository } from "../../../domain/category.repository";

interface GetCategoriesDTO {
  // No input required for getting all categories
}

interface CategoryResponse {
  id: number;
  name: string;
}

type GetCategoriesResult = Result<CategoryResponse[], string>;

export class GetCategoriesUseCase
  implements UseCase<GetCategoriesDTO, GetCategoriesResult>
{
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(request: GetCategoriesDTO): Promise<GetCategoriesResult> {
    try {
      const categories = await this.categoryRepository.findAll();

      const response: CategoryResponse[] = categories.map((category) => ({
        id: parseInt(category.id.toString()),
        name: category.name,
      }));

      return Result.ok<CategoryResponse[]>(response);
    } catch (error) {
      return Result.fail<CategoryResponse[], string>(
        "Failed to fetch categories"
      );
    }
  }
}
