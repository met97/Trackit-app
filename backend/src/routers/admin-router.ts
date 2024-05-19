import { Router } from "express";

// import dei controller
import * as adminController from "../controllers/admin-controller";

// istanzio router
const router: Router = Router();

// routing
router.post("/api/admin/upload", adminController.uploadNewShow);

export default router;
