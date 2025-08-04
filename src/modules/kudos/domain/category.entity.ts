import { Entity } from "../../../shared/domain/entity";
import { UniqueEntityID } from "../../../shared/domain/unique-entity-id";
import { Result } from "../../../shared/core/result";

interface CategoryProps {
  name: string;
}

export class Category extends Entity<CategoryProps> {
  private constructor(props: CategoryProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  public static create(
    props: CategoryProps,
    id?: UniqueEntityID
  ): Result<Category> {
    if (!props.name || props.name.trim().length === 0) {
      return Result.fail<Category>("Category name is required");
    }

    if (props.name.trim().length < 2) {
      return Result.fail<Category>(
        "Category name must be at least 2 characters long"
      );
    }

    if (props.name.trim().length > 50) {
      return Result.fail<Category>("Category name cannot exceed 50 characters");
    }

    const category = new Category(
      {
        ...props,
        name: props.name.trim(),
      },
      id
    );

    return Result.ok<Category>(category);
  }
}
