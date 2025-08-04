import { Router, Request, Response } from "express";
import { RegisterUserUseCase } from "../../application/use-cases/register-user/register-user.use-case";
import { LoginUseCase } from "../../application/use-cases/login/login.use-case";
import { GetRecipientsUseCase } from "../../application/use-cases/get-recipients/get-recipients.use-case";
import { UserController } from "../controllers/user.controller";
import { LoginController } from "../controllers/login.controller";
import { RecipientsController } from "../controllers/recipients.controller";
import { validateToken } from "../../../../shared/presentation/middleware/token-validation.middleware";

interface UserRoutesDependencies {
  registerUserUseCase: RegisterUserUseCase;
  loginUseCase: LoginUseCase;
  getRecipientsUseCase: GetRecipientsUseCase;
}

const setupUserRoutes = (dependencies: UserRoutesDependencies): Router => {
  const router = Router();
  const userController = new UserController(dependencies.registerUserUseCase);
  const loginController = new LoginController(dependencies.loginUseCase);
  const recipientsController = new RecipientsController(
    dependencies.getRecipientsUseCase
  );

  router.post("/register", async (req: Request, res: Response) => {
    const result = await userController.handle(req);
    res.status(result.statusCode).json(result.body);
  });

  router.post("/login", async (req: Request, res: Response) => {
    const result = await loginController.handle(req);
    res.status(result.statusCode).json(result.body);
  });

  router.get(
    "/recipients",
    validateToken,
    async (req: Request, res: Response) => {
      const result = await recipientsController.handle(req);
      res.status(result.statusCode).json(result.body);
    }
  );

  return router;
};

export default setupUserRoutes;
