import { Entity } from "../../../shared/domain/entity";
import { UniqueEntityID } from "../../../shared/domain/unique-entity-id";
import { Result } from "../../../shared/core/result";
import { Email } from "./value-objects/email";
import { Password } from "./value-objects/password";

interface UserProps {
  email: Email;
  password: Password;
  isEmailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): Password {
    return this.props.password;
  }

  get isEmailVerified(): boolean {
    return this.props.isEmailVerified || false;
  }

  get createdAt(): Date {
    return this.props.createdAt || new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt || new Date();
  }

  public static create(props: UserProps, id?: UniqueEntityID): Result<User> {
    const defaultProps: UserProps = {
      ...props,
      isEmailVerified: props.isEmailVerified || false,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };

    return Result.ok(new User(defaultProps, id));
  }

  public markEmailAsVerified(): void {
    this.props.isEmailVerified = true;
    this.props.updatedAt = new Date();
  }
}
