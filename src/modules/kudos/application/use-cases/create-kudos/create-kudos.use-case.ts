import { UseCase } from "../../../../../shared/core/use-case";
import { Result } from "../../../../../shared/core/result";
import { Kudos } from "../../../domain/kudos.entity";
import { KudosRepository } from "../../../domain/kudos.repository";
import { ValidationError } from "../../../domain/errors/validation.error";

interface CreateKudosDTO {
  senderId: string;
  recipientId: string;
  message: string;
  category: string;
}

type CreateKudosResult = Result<void>;

export class CreateKudosUseCase
  implements UseCase<CreateKudosDTO, CreateKudosResult>
{
  constructor(private kudosRepository: KudosRepository) {}

  async execute(request: CreateKudosDTO): Promise<CreateKudosResult> {
    const kudosOrError = Kudos.create({
      senderId: request.senderId,
      recipientId: request.recipientId,
      message: request.message,
      category: request.category,
      createdAt: new Date(),
    });

    if (kudosOrError.isFailure) {
      return Result.fail<void>(kudosOrError.error);
    }

    const kudos = kudosOrError.getValue();

    try {
      await this.kudosRepository.create(kudos);
      return Result.ok<void>();
    } catch (error) {
      return Result.fail<void>(new Error("Failed to create kudos"));
    }
  }
}
