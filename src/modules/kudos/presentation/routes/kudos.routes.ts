import { Router } from "express";
import { KudosController } from "../controllers/kudos.controller";
import { validateToken } from "../../../../shared/presentation/middleware/token-validation.middleware";

export const kudosRouter = Router();

export const makeKudosRoutes = (controller: KudosController) => {
  // Create kudos (requires authentication)
  kudosRouter.post("/", validateToken, async (req, res) => {
    const result = await controller.handle(req);
    res.status(result.statusCode).json(result.body);
  });

  return kudosRouter;
};
