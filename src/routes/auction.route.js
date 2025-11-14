import express from "express";
import auctionController from "../controllers/auction.controller.js";

const router = express.Router();

router.get("/", auctionController.showAllAuctions);

export default router;