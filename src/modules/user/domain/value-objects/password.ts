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
    if (!this.isValidPassword(password)) {
      return Result.fail<Password>(
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character"
      );
    }

    return Result.ok(new Password({ value: password, hashed: false }));
  }

  public static createHashed(hashedPassword: string): Result<Password> {
    return Result.ok(new Password({ value: hashedPassword, hashed: true }));
  }

  private static isValidPassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  public async hashPassword(): Promise<Password> {
    if (this.props.hashed) {
      return this;
    }

    const hashedPassword = await bcrypt.hash(this.props.value, 10);
    return Password.createHashed(hashedPassword).getValue();
  }
}
