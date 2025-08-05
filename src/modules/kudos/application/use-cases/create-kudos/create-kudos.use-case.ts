import { UseCase } from "../../../../../shared/core/use-case";
import { Result } from "../../../../../shared/core/result";
import { Kudos } from "../../../domain/kudos.entity";
import { KudosRepository } from "../../../domain/kudos.repository";
import { UserRepository } from "../../../../user/domain/user.repository";
import { CategoryRepository } from "../../../../category/domain/category.repository";
import { ValidationError } from "../../../domain/errors/validation.error";
import { RoleType } from "../../../../user/domain/value-objects/role-type";

interface CreateKudosDTO {
  senderId: string;
  recipientId: string;
  message: string;
  categoryId: number;
}

interface CreateKudosResponse {
  id: string;
  senderName: string;
  receiverName: string;
  categoryName: string;
  message: string;
  createdAt: Date;
}

type CreateKudosResult = Result<CreateKudosResponse, string>;

export class CreateKudosUseCase
  implements UseCase<CreateKudosDTO, CreateKudosResult>
{
  constructor(
    private kudosRepository: KudosRepository,
    private userRepository: UserRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async execute(request: CreateKudosDTO): Promise<CreateKudosResult> {

    // Validate sender exists
    const sender = await this.userRepository.findById(request.senderId);
    if (!sender) {
      return Result.fail<CreateKudosResponse, string>("Invalid sender");
    }

    if(sender.roleType !== RoleType.TEAMLEAD) {
      return Result.fail<CreateKudosResponse, string>("Sender is not a team lead");
    }

    // Validate category exists
    const category = await this.categoryRepository.findById(Number(request.categoryId));
    if (!category) {
      return Result.fail<CreateKudosResponse, string>("Invalid category");
    }

    

    // Validate recipient exists
    const recipient = await this.userRepository.findById(request.recipientId);
    if (!recipient) {
      return Result.fail<CreateKudosResponse, string>("Invalid recipient");
    }

    const kudosOrError = Kudos.create({
      senderId: request.senderId,
      recipientId: request.recipientId,
      message: request.message,
      categoryId: request.categoryId,
      createdAt: new Date(),
    });

    if (kudosOrError.isFailure) {
      return Result.fail<CreateKudosResponse, string>(kudosOrError.error());
    }

    const kudos = kudosOrError.getValue();

    try {
      await this.kudosRepository.create(kudos);

      const response: CreateKudosResponse = {
        id: kudos.id.toString(),
        senderName: sender.name,
        receiverName: recipient.name,
        categoryName: category.name,
        message: kudos.message,
        createdAt: kudos.createdAt,
      };

      return Result.ok<CreateKudosResponse>(response);
    } catch (error) {
      return Result.fail<CreateKudosResponse, string>("Failed to create kudos");
    }
  }
}
