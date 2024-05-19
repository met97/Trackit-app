import { Router } from "express";

// import dei controller
import * as directorController from "../controllers/director-controller";

// istanzio router
const router: Router = Router();

// routing
router.get("/api/director/:showid", directorController.getDirectorByShowId);

export default router;
