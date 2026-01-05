import express from "express";
import userController from "../controllers/user.controller.js";

import { isSeller } from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/", userController.getProfileInformation);
router.get("/profile", userController.getProfileInformation);
router.get("/reviews", userController.getReviews);
router.get("/watch-list", userController.getWatchList);
router.get("/upgrade-seller", userController.showUpgrageSeller);
router.post("/upgrade-seller", userController.requestUpgradeSeller);
router.get("/auctions", isSeller, userController.getMyAuctions);
router.get("/auctions-won", userController.getWinAutions);
router.get("/bids", userController.getBids);
router.post("/ratings/:id", userController.addRating);
router.patch("/profile", userController.updateProfileInformation);
router.patch("/password", userController.changePassword);

export default router;