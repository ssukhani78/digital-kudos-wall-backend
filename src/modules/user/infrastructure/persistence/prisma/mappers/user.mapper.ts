import { User as PrismaUser, Prisma } from "@prisma/client";
import { User, UserSnapshot } from "../../../../domain/user.entity";
import { Email } from "../../../../domain/value-objects/email";
import { Password } from "../../../../domain/value-objects/password";
import { UniqueEntityID } from "../../../../../../shared/domain/unique-entity-id";
import { RoleType } from "../../../../domain/value-objects/role-type";

export class UserMapper {
  static toDomain(prismaUser: any): User {
    const emailOrError = Email.create(prismaUser.email);
    const passwordOrError = Password.reconstitute(prismaUser.password); // Assumes this method exists in Password VO

    if (emailOrError.isFailure) {
      console.error(
        "Error creating Email VO from Prisma data:",
        emailOrError.error()
      );
      throw new Error(
        `Failed to map email for user ${
          prismaUser.id
        }. Reason: ${emailOrError.error()}`
      );
    }
    if (passwordOrError.isFailure) {
      console.error(
        "Error reconstituting Password VO from Prisma data:",
        passwordOrError.error()
      );
      throw new Error(
        `Failed to map password for user ${
          prismaUser.id
        }. Reason: ${passwordOrError.error()}`
      );
    }

    const userSnapshot: UserSnapshot = {
      id: new UniqueEntityID(prismaUser.id),
      name: prismaUser.name,
      email: emailOrError.getValue(),
      password: passwordOrError.getValue(),
      isEmailVerified: prismaUser.isEmailVerified || false, // Assumes isEmailVerified exists on prismaUser
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      roleId: prismaUser.roleId,
      roleType: prismaUser.role?.role as RoleType,
    };

    const userOrError = User.reconstitute(userSnapshot);

    if (userOrError.isFailure) {
      console.error(
        "Error reconstituting User entity from Prisma data:",
        userOrError.error()
      );
      throw new Error(
        `Failed to reconstitute user ${
          prismaUser.id
        }. Reason: ${userOrError.error()}`
      );
    }

    return userOrError.getValue();
  }

  static toPersistence(user: User): Prisma.UserCreateInput {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email.value,
      password: user.password.value,
      isEmailVerified: user.isEmailVerified,
      role: { connect: { id: user.roleId } },
    };
  }
}
