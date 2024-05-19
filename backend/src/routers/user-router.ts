import { Router } from "express";

// import dei controller
import * as userController from "../controllers/user-controller";

// istanzio router
const router: Router = Router();

// routing
router.get("/api/users", userController.getUsersData);
router.get("/api/user/wishlisted/:userid", userController.getWishlistedShows);
router.get("/api/user/inprogress/:userid", userController.getInProgressShows);
router.get("/api/user/completed/:userid", userController.getCompletedShows);
router.get("/api/addtowishlist/:userid/:showid", userController.addToWishlist);
router.get(
	"/api/addtocompleted/:userid/:showid",
	userController.addToCompleted
);
router.get("/api/user/seenepisodes/:userid/:showid", userController.getSeenEps);
router.get(
	"/api/setepisodeseen/:userid/:showid/:seasonid/:episodeid",
	userController.setEpisodeSeen
);
router.get(
	"/api/setepisodeunseen/:userid/:showid/:seasonid/:episodeid",
	userController.setEpisodeUnseen
);

export default router;
