import { ValueObject } from "../../../../shared/domain/value-object";
import { Result } from "../../../../shared/core/result";
import * as bcrypt from "bcrypt";

interface PasswordProps {
  value: string;
  hashed?: boolean;
}

export class Password extends ValueObject<PasswordProps> {
  private constructor(props: PasswordProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public async comparePassword(plainTextPassword: string): Promise<boolean> {
    if (this.props.hashed) {
      return await bcrypt.compare(plainTextPassword, this.props.value);
    }
    return this.props.value === plainTextPassword;
  }

  public static create(password: string): Result<Password> {
    const validationError = this.getValidationError(password);
    if (validationError) {
      return Result.fail<Password>(validationError);
    }

    return Result.ok(new Password({ value: password, hashed: false }));
  }

  public static createHashed(hashedPassword: string): Result<Password> {
    return Result.ok(new Password({ value: hashedPassword, hashed: true }));
  }

  private static getValidationError(password: string): string | null {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character";
    }

    return null; // No validation errors
  }

  private static isValidPassword(password: string): boolean {
    return this.getValidationError(password) === null;
  }

  public async hashPassword(): Promise<Password> {
    if (this.props.hashed) {
      return this;
    }

    const hashedPassword = await bcrypt.hash(this.props.value, 10);
    return Password.createHashed(hashedPassword).getValue();
  }

  public static reconstitute(hashedPassword: string): Result<Password, string> {
    if (!hashedPassword || hashedPassword.length === 0) {
      return Result.fail<Password>("Stored password cannot be empty.");
    }
    return Result.ok<Password>(new Password({ value: hashedPassword, hashed: true }));
  }
}
