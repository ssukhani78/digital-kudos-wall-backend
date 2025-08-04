import { Request, Response } from "express";
import { Controller } from "../../../../shared/presentation/controller";
import { CreateKudosUseCase } from "../../application/use-cases/create-kudos/create-kudos.use-case";
import { GetCategoriesUseCase } from "../../application/use-cases/get-categories/get-categories.use-case";
import { ValidationError } from "../../domain/errors/validation.error";
import { AuthenticatedRequest } from "../../../../shared/presentation/middleware/token-validation.middleware";
import { HttpResponse } from "../../../../shared/presentation/http-response";

export class KudosController implements Controller<AuthenticatedRequest, any> {
  constructor(
    private createKudosUseCase: CreateKudosUseCase,
    private getCategoriesUseCase: GetCategoriesUseCase
  ) {}

  async createKudos(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { recipientId, message, categoryId } = req.body;
      const senderId = req.user?.id;

      if (!senderId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const result = await this.createKudosUseCase.execute({
        senderId,
        recipientId,
        message,
        categoryId,
      });

      if (result.isFailure) {
        if (result.error instanceof ValidationError) {
          res.status(400).json({
            success: false,
            message: result.error.message,
          });
          return;
        }
        res.status(500).json({
          success: false,
          message: result.error,
        });
        return;
      }

      const kudosData = result.getValue();
      res.status(201).json({
        success: true,
        data: kudosData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
      });
    }
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getCategoriesUseCase.execute({});

      if (result.isFailure) {
        res.status(500).json({
          success: false,
          message: result.error,
        });
        return;
      }

      const categories = result.getValue();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
      });
    }
  }
}
