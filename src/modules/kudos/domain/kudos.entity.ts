import { Entity } from "../../../shared/domain/entity";
import { UniqueEntityID } from "../../../shared/domain/unique-entity-id";
import { Result } from "../../../shared/core/result";
import { ValidationError } from "../domain/errors/validation.error";

interface KudosProps {
  senderId: string;
  recipientId: string;
  message: string;
  category: string;
  createdAt: Date;
}

export class Kudos extends Entity<KudosProps> {
  private constructor(props: KudosProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get senderId(): string {
    return this.props.senderId;
  }

  get recipientId(): string {
    return this.props.recipientId;
  }

  get message(): string {
    return this.props.message;
  }

  get category(): string {
    return this.props.category;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  public static create(props: KudosProps, id?: UniqueEntityID): Result<Kudos> {
    // Validate message length (20-200 characters)
    if (!props.message || props.message.length < 20) {
      return Result.fail(
        new ValidationError("Message must be at least 20 characters long")
      );
    }
    if (props.message.length > 200) {
      return Result.fail(
        new ValidationError("Message cannot exceed 200 characters")
      );
    }

    // Prevent self-kudos
    if (props.senderId === props.recipientId) {
      return Result.fail(
        new ValidationError("Cannot create kudos for yourself")
      );
    }

    // Validate required fields
    if (!props.message.trim()) {
      return Result.fail(new ValidationError("Message cannot be empty"));
    }
    if (!props.category.trim()) {
      return Result.fail(new ValidationError("Category is required"));
    }

    const kudos = new Kudos(
      {
        ...props,
        createdAt: props.createdAt || new Date(),
      },
      id
    );

    return Result.ok(kudos);
  }
}
