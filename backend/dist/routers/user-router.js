"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import dei controller
const userController = __importStar(require("../controllers/user-controller"));
// istanzio router
const router = (0, express_1.Router)();
// routing
router.get("/api/users", userController.getUsersData);
router.get("/api/user/wishlisted/:userid", userController.getWishlistedShows);
router.get("/api/user/inprogress/:userid", userController.getInProgressShows);
router.get("/api/user/completed/:userid", userController.getCompletedShows);
router.get("/api/addtowishlist/:userid/:showid", userController.addToWishlist);
router.get("/api/addtocompleted/:userid/:showid", userController.addToCompleted);
router.get("/api/user/seenepisodes/:userid/:showid", userController.getSeenEps);
router.get("/api/setepisodeseen/:userid/:showid/:seasonid/:episodeid", userController.setEpisodeSeen);
router.get("/api/setepisodeunseen/:userid/:showid/:seasonid/:episodeid", userController.setEpisodeUnseen);
exports.default = router;
