import { Controller } from "../../../../shared/presentation/controller";
import { GetRecipientsUseCase } from "../../application/use-cases/get-recipients/get-recipients.use-case";
import { HttpResponse } from "../../../../shared/presentation/http-response";
import { AuthenticatedRequest } from "../../../../shared/presentation/middleware/token-validation.middleware";

export class RecipientsController
  implements Controller<AuthenticatedRequest, any>
{
  constructor(private readonly getRecipientsUseCase: GetRecipientsUseCase) {}

  async handle(request: AuthenticatedRequest): Promise<HttpResponse<any>> {
    const loggedInUserId = request.user?.id;

    if (!loggedInUserId) {
      return HttpResponse.unauthorized({
        message: "Authentication required",
      });
    }

    try {
      const recipients = await this.getRecipientsUseCase.execute({
        loggedInUserId,
      });

      return HttpResponse.ok({
        data: recipients,
      });
    } catch (error) {
      return HttpResponse.serverError({
        message: "An unexpected error occurred",
      });
    }
  }
}
