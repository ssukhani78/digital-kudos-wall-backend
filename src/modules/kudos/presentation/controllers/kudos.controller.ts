import { Controller } from "../../../../shared/presentation/controller";
import { CreateKudosUseCase } from "../../application/use-cases/create-kudos/create-kudos.use-case";
import { ValidationError } from "../../domain/errors/validation.error";
import { AuthenticatedRequest } from "../../../../shared/presentation/middleware/token-validation.middleware";
import { HttpResponse } from "../../../../shared/presentation/http-response";

export class KudosController implements Controller<AuthenticatedRequest, any> {
  constructor(private createKudosUseCase: CreateKudosUseCase) {}

  async handle(req: AuthenticatedRequest): Promise<HttpResponse<any>> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return HttpResponse.unauthorized({
          success: false,
          message: "Authentication required",
        });
      }

      const { recipientId, message, categoryId } = req.body;

      const result = await this.createKudosUseCase.execute({
        senderId: userId,
        recipientId,
        message,
        categoryId,
      });

      if (result.isFailure) {
        if (result.error instanceof ValidationError) {
          return HttpResponse.badRequest({
            success: false,
            message: result.error(),
          });
        }
        return HttpResponse.badRequest({
          success: false,
          message: result.error(),
        });
      }

      const kudosData = result.getValue();
      return HttpResponse.created({
        success: true,
        data: kudosData,
      });
    } catch (error) {
      return HttpResponse.serverError({
        success: false,
        message: "An unexpected error occurred",
      });
    }
  }
}
