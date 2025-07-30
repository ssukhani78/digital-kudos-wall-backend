import { Result } from "../../../../shared/core/result";
import { ValueObject } from "../../../../shared/domain/value-object";

export interface RoleIdProps {
  value: number;
}

export class RoleId extends ValueObject<RoleIdProps> {
  private constructor(props: RoleIdProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }

  public static create(roleId: number): Result<RoleId, string> {
    if (!roleId) {
      return Result.fail("Role Id is required");
    }
    roleId = Number(roleId);
    if (typeof roleId !== "number" || !Number.isInteger(roleId) || roleId < 1) {
      return Result.fail("RoleId must be a positive integer.");
    }
    return Result.ok(new RoleId({ value: roleId }));
  }
}
