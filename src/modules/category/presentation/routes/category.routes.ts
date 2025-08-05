import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { validateToken } from "../../../../shared/presentation/middleware/token-validation.middleware";

export const categoryRouter = Router();

export const makeCategoryRoutes = (controller: CategoryController) => {
  categoryRouter.get("/", validateToken, async (req, res) => {
    const result = await controller.handle(req);
    res.status(result.statusCode).json(result.body);
  });

  return categoryRouter;
};
