import { Request, Response } from "express";
import { Controller } from "../../../../shared/presentation/controller";
import { GetCategoriesUseCase } from "../../application/use-cases/get-categories/get-categories.use-case";
import { HttpResponse } from "../../../../shared/presentation/http-response";

export class CategoryController implements Controller<Request, any> {
  constructor(private getCategoriesUseCase: GetCategoriesUseCase) {}

  async handle(req: Request): Promise<HttpResponse<any>> {
    try {
      const result = await this.getCategoriesUseCase.execute({});

      if (result.isFailure) {
        return HttpResponse.serverError({
          success: false,
          message: result.error(),
        });
      }

      const categories = result.getValue();
      return HttpResponse.ok({
        success: true,
        data: categories,
      });
    } catch (error) {
      return HttpResponse.serverError({
        success: false,
        message: "An unexpected error occurred",
      });
    }
  }
}
 