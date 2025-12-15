import express from "express";
import watchListController from "../controllers/watch-list.controller.js";

const router = express.Router();

router.post("/del/:id", watchListController.deleteWatchlistItem);
router.post("/add", watchListController.addWatchListItem);

export default router;
