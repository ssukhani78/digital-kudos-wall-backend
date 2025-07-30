import { Request, Response } from "express";
import { Controller } from "../../../../shared/presentation/controller";
import { CreateKudosUseCase } from "../../application/use-cases/create-kudos/create-kudos.use-case";
import { ValidationError } from "../../domain/errors/validation.error";

export class KudosController extends Controller {
  constructor(private createKudosUseCase: CreateKudosUseCase) {
    super();
  }

  async createKudos(req: Request, res: Response): Promise<Response> {
    try {
      const { recipientId, message, category } = req.body;
      const senderId = req.user?.id; // Assuming user is set by auth middleware

      if (!senderId) {
        return this.unauthorized(res);
      }

      const result = await this.createKudosUseCase.execute({
        senderId,
        recipientId,
        message,
        category,
      });

      if (result.isFailure) {
        if (result.error instanceof ValidationError) {
          return this.badRequest(res, result.error.message);
        }
        return this.fail(res, result.error.message);
      }

      return this.created(res);
    } catch (error) {
      return this.fail(res, error);
    }
  }
}
