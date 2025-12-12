import express from "express";
import auctionController from "../controllers/auction.controller.js";
import upload from "../utils/upload.js";
import { ensureAuthenticated } from "../middlewares/authenticate.js"

const router = express.Router();

router.get("/", auctionController.getAllAuctions);
router.get("/create", ensureAuthenticated, auctionController.getCreateAuction);
router.get("/search", auctionController.searchAuctions);
router.get("/categories/:category", auctionController.getAuctionsByCategory);
router.get("/:id", auctionController.getAuctionsById);
router.post("/",
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImage', maxCount: 10 }
    ]),
    auctionController.addAuction);


export default router;