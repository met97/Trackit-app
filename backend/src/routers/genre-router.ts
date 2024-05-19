import { Router } from "express";

// import dei controller
import * as genreController from "../controllers/genre-controller";

// istanzio router
const router: Router = Router();

// routing
router.get("/api/genres", genreController.getGenres);
router.get("/api/genres/:showid", genreController.getGenresByShowId);

export default router;
