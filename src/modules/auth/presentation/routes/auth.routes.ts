import { Router } from "express";
import { RegisterController } from "../controllers/register.controller";
import { LoginController } from "../controllers/login.controller";

export const authRouter = Router();

export const makeAuthRoutes = (
  registerController: RegisterController,
  loginController: LoginController
) => {
  // Register new user
  authRouter.post("/register", async (req, res) => {
    const result = await registerController.handle(req);
    res.status(result.statusCode).json(result.body);
  });

  // Login user
  authRouter.post("/login", async (req, res) => {
    const result = await loginController.handle(req);
    res.status(result.statusCode).json(result.body);
  });

  return authRouter;
};
 