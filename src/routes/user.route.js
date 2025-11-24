import express from "express";
import userController from "../controllers/user.controller.js";
import { ensureAuthenticated } from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/", userController.getProfileInformation);
router.get("/profile", userController.getProfileInformation);
router.get("/reviews", userController.getReviews);
router.get("/watch-list", userController.getWatchList);
router.get("/activity-bids", userController.getActivityBids);
router.patch("/profile", userController.updateProfileInformation);

export default router;