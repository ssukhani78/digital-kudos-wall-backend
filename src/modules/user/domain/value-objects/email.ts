import { ValueObject } from "../../../../shared/domain/value-object";
import { Result } from "../../../../shared/core/result";

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(email: string): Result<Email, string> {
    if (!email) {
      return Result.fail("Email is required");
    }

    if (!this.isValidEmail(email)) {
      return Result.fail("Invalid email format");
    }

    return Result.ok(new Email({ value: email }));
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public equals(email?: Email): boolean {
    if (email === null || email === undefined) {
      return false;
    }
    return this.props.value === email.props.value;
  }
}
