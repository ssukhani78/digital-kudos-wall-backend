import { DomainError } from "../../../../shared/domain/domain.error";

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}
