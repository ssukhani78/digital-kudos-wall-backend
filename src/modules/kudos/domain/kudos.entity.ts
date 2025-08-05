import { Entity } from "../../../shared/domain/entity";
import { UniqueEntityID } from "../../../shared/domain/unique-entity-id";
import { ValidationError } from "./errors/validation.error";
import { Result } from "../../../shared/core/result";

interface KudosProps {
  senderId: string;
  recipientId: string;
  message: string;
  categoryId: number;
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

  get categoryId(): number {
    return this.props.categoryId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  public static create(
    props: KudosProps,
    id?: UniqueEntityID
  ): Result<Kudos, string> {
    // Validate message length (20-200 characters)
    if (!props.message || props.message.length < 20) {
      return Result.fail<Kudos, string>(
        "Message must be at least 20 characters long"
      );
    }
    if (props.message.length > 200) {
      return Result.fail<Kudos, string>("Message cannot exceed 200 characters");
    }

    // Prevent self-kudos
    if (props.senderId === props.recipientId) {
      return Result.fail<Kudos, string>("Cannot create kudos for yourself");
    }

    // Validate required fields
    if (!props.message.trim()) {
      return Result.fail<Kudos, string>("Message cannot be empty");
    }
    if (!props.categoryId || props.categoryId <= 0) {
      return Result.fail<Kudos, string>("Valid category is required");
    }

    const kudos = new Kudos(
      {
        ...props,
        categoryId: Number(props.categoryId),
        message: props.message.trim(),
      },
      id
    );

    return Result.ok<Kudos>(kudos);
  }
}
