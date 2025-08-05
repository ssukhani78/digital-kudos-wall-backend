import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateToken } from "../../../../shared/presentation/middleware/token-validation.middleware";
import { GetRecipientsUseCase } from "../../application/use-cases/get-recipients/get-recipients.use-case";

export interface UserRoutesDependencies {
  getRecipientsUseCase: GetRecipientsUseCase;
}

export default function setupUserRoutes(dependencies: UserRoutesDependencies) {
  const router = Router();
  const userController = new UserController(dependencies.getRecipientsUseCase);

  // Get recipients (requires authentication)
  router.get("/recipients", validateToken, async (req, res) => {
    const result = await userController.handle(req);
    res.status(result.statusCode).json(result.body);
  });

  return router;
}
