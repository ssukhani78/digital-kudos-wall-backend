import { UseCase } from "../../../../../shared/core/use-case";
import { Result } from "../../../../../shared/core/result";
import { User } from "../../../domain/user.entity";
import { UserRepository } from "../../../domain/user.repository";

interface GetRecipientsDTO {
  userId: string;
}

interface RecipientResponse {
  id: string;
  name: string;
  email: string;
}

type GetRecipientsResult = Result<RecipientResponse[]>;

export class GetRecipientsUseCase
  implements UseCase<GetRecipientsDTO, GetRecipientsResult>
{
  constructor(private userRepository: UserRepository) {}

  async execute(request: GetRecipientsDTO): Promise<GetRecipientsResult> {
    try {
      const users = await this.userRepository.findAllExceptUser(request.userId);

      const response: RecipientResponse[] = users.map((user) => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email.value,
      }));

      return Result.ok<RecipientResponse[]>(response);
    } catch (error) {
      return Result.fail<RecipientResponse[], string>(
        "Failed to fetch recipients"
      );
    }
  }
}
