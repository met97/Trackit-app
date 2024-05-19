import { Router } from "express";

// import dei controller
import * as showsController from "../controllers/shows-controller";

// istanzio router
const router: Router = Router();

// routing
router.get("/api/randshows/:n", showsController.getRandomShows);
router.get("/api/shows", showsController.getShows);
router.get("/api/shows/:genre", showsController.getShowsByGenre);
router.get("/api/show/:id", showsController.getShowById);
router.get("/api/episodes/:showid", showsController.getEpisodesByShowId);

export default router;
