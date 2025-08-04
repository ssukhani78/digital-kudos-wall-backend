import { UseCase } from "../../../../../shared/core/use-case";
import { UserRepository } from "../../../domain/user.repository";

export interface GetRecipientsDTO {
  loggedInUserId: string;
}

export interface RecipientResponse {
  id: string;
  name: string;
}

export class GetRecipientsUseCase
  implements UseCase<GetRecipientsDTO, RecipientResponse[]>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: GetRecipientsDTO): Promise<RecipientResponse[]> {
    try {
      const users = await this.userRepository.findAllExceptUser(
        request.loggedInUserId
      );

      const recipients: RecipientResponse[] = users.map((user) => ({
        id: user.id.toString(),
        name: user.name,
      }));

      return recipients;
    } catch (error) {
      throw new Error("Failed to fetch recipients");
    }
  }
}
