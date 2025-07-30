import { Router } from "express";
import { KudosController } from "../controllers/kudos.controller";
import { authenticateUser } from "../../../../shared/presentation/middleware/auth.middleware";

export const kudosRouter = Router();

export const makeKudosRoutes = (controller: KudosController) => {
  // Create kudos (requires authentication)
  kudosRouter.post("/", authenticateUser, (req, res) =>
    controller.createKudos(req, res)
  );

  return kudosRouter;
};
