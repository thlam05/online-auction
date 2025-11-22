import express from "express";
import auctionController from "../controllers/auction.controller.js";

const router = express.Router();

router.get("/", auctionController.getAllAuctions);
router.get("/category", auctionController.getAuctionsByCategory);
router.get("/:id", auctionController.getAuctionsById);

export default router;