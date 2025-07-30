import { Entity } from "../../../shared/domain/entity";
import { UniqueEntityID } from "../../../shared/domain/unique-entity-id";
import { Result } from "../../../shared/core/result";
import { Email } from "./value-objects/email";
import { Password } from "./value-objects/password";
import { RoleType } from "./value-objects/role-type";

export interface UserProps {
  name: string;
  email: Email;
  password: Password;
  isEmailVerified: boolean;
  roleId: number;
  roleType?: RoleType;
}

export interface UserSnapshot extends UserProps {
  id: UniqueEntityID;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
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

  get roleId(): number {
    return this.props.roleId;
  }

  get roleType(): RoleType | undefined {
    return this.props.roleType;
  }

  public static create(props: UserProps, id?: UniqueEntityID): Result<User> {
    const defaultProps: UserProps = {
      ...props,
      isEmailVerified: props.isEmailVerified || false,
      roleId: props.roleId,
      roleType: props.roleType,
    };

    return Result.ok(new User(defaultProps, id));
  }

  public static reconstitute(snapshot: UserSnapshot): Result<User, string> {
    const user = new User(
      {
        name: snapshot.name,
        email: snapshot.email,
        password: snapshot.password,
        isEmailVerified: snapshot.isEmailVerified,
        roleId: snapshot.roleId,
        roleType: snapshot.roleType,
      },
      snapshot.id
    );

    return Result.ok<User>(user);
  }
}
