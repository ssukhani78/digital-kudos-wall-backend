import { Router } from "express";
import { KudosController } from "../controllers/kudos.controller";
import { validateToken } from "../../../../shared/presentation/middleware/token-validation.middleware";

export const kudosRouter = Router();

export const makeKudosRoutes = (controller: KudosController) => {
  // Get all categories (public endpoint)
  kudosRouter.get("/categories", (req, res) =>
    controller.getCategories(req, res)
  );

  // Create kudos (requires authentication)
  kudosRouter.post("/", validateToken, (req, res) =>
    controller.createKudos(req, res)
  );

  return kudosRouter;
};
