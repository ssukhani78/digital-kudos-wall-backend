import { Router, Request, Response } from "express";
import { RegisterUserUseCase } from "../application/register-user.use-case";
import { UserController } from "./user.controller";

const setupUserRoutes = (registerUserUseCase: RegisterUserUseCase): Router => {
  const router = Router();
  const userController = new UserController(registerUserUseCase);

  router.post("/register", (req: Request, res: Response) => userController.register(req, res));

  return router;
};

export default setupUserRoutes;
