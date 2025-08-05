import { Controller } from "../../../../shared/presentation/controller";
import { GetRecipientsUseCase } from "../../application/use-cases/get-recipients/get-recipients.use-case";
import { AuthenticatedRequest } from "../../../../shared/presentation/middleware/token-validation.middleware";
import { HttpResponse } from "../../../../shared/presentation/http-response";

export class UserController implements Controller<AuthenticatedRequest, any> {
  constructor(private getRecipientsUseCase: GetRecipientsUseCase) {}

  async handle(req: AuthenticatedRequest): Promise<HttpResponse<any>> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return HttpResponse.unauthorized({
          success: false,
          message: "Authentication required",
        });
      }

      const result = await this.getRecipientsUseCase.execute({ userId });

      if (result.isFailure) {
        return HttpResponse.serverError({
          success: false,
          message: result.error(),
        });
      }

      const recipients = result.getValue();
      return HttpResponse.ok({
        success: true,
        data: recipients,
      });
    } catch (error) {
      return HttpResponse.serverError({
        success: false,
        message: "An unexpected error occurred",
      });
    }
  }
}
