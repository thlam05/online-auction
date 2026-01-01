import express from "express";
import auctionController from "../controllers/auction.controller.js";
import upload from "../utils/upload.js";
import { ensureAuthenticated, isSeller } from "../middlewares/authenticate.js"

const router = express.Router();

router.get("/", auctionController.getAllAuctions);
router.get("/create", ensureAuthenticated, isSeller, auctionController.getCreateAuction);
router.get("/search", auctionController.searchAuctions);
router.get("/categories/:category", auctionController.getAuctionsByCategory);
router.get("/:id", auctionController.getAuctionsById);
router.get("/edit/:id", ensureAuthenticated, isSeller, auctionController.getEditAuctions);
router.post("/:id/messages", ensureAuthenticated, auctionController.sendMessage);
router.post("/:id/bids", ensureAuthenticated, auctionController.bidAuctions)
router.post("/:id/block-bidder", ensureAuthenticated, auctionController.blockBidder);
router.post("/edit", auctionController.updateDesAuction);
router.post("/",
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImage', maxCount: 10 }
    ]),
    auctionController.addAuction);


export default router;