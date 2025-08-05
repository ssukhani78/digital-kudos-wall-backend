import { Request, Response } from "express";
import { Controller } from "../../../../shared/presentation/controller";
import { RegisterUseCase } from "../../application/use-cases/register/register.use-case";
import { UserAlreadyExistsError } from "../../../user/domain/errors/user-already-exists.error";
import { ValidationError } from "../../../user/domain/errors/validation.error";
import { HttpResponse } from "../../../../shared/presentation/http-response";

export class RegisterController implements Controller<Request, any> {
  constructor(private registerUseCase: RegisterUseCase) {}

  async handle(req: Request): Promise<HttpResponse<any>> {
    try {
      const { name, email, password, roleId } = req.body;


      const result = await this.registerUseCase.execute({
        name,
        email,
        password,
        roleId: Number(roleId),
      });

      if (result.isFailure) {
        if (result.error instanceof UserAlreadyExistsError) {
          return HttpResponse.conflict({
            success: false,
            message: result.error(),
          });
        }
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

      const userData = result.getValue();
      return HttpResponse.created({
        success: true,
        data: userData,
      });
    } catch (error) {
      return HttpResponse.serverError({
        success: false,
        message: "An unexpected error occurred",
      });
    }
  }
}
