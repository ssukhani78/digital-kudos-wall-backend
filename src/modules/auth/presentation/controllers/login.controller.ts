import { Request, Response } from "express";
import { Controller } from "../../../../shared/presentation/controller";
import { LoginUseCase } from "../../application/use-cases/login/login.use-case";
import { InvalidCredentialsError } from "../../../user/domain/errors/invalid-credentials.error";
import { HttpResponse } from "../../../../shared/presentation/http-response";

export class LoginController implements Controller<Request, any> {
  constructor(private loginUseCase: LoginUseCase) {}

  async handle(req: Request): Promise<HttpResponse<any>> {
    try {
      const { email, password } = req.body;

      const result = await this.loginUseCase.execute({
        email,
        password,
      });

      if (result.isFailure) {
        if (result.error() === "Invalid email or password") {
          return HttpResponse.badRequest({
            success: false,
            message: result.error(),
          });
        }
        return HttpResponse.unauthorized({
          success: false,
          message: result.error(),
        });
      }

      const loginData = result.getValue();
      return HttpResponse.ok({
        success: true,
        data: loginData,
      });
    } catch (error) {
      return HttpResponse.serverError({
        success: false,
        message: "An unexpected error occurred",
      });
    }
  }
}
 