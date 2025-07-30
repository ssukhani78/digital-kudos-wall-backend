import { DomainError } from "../../../../shared/domain/domain.error";

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
