import auctionModel from "../models/auction.model.js";
import bidModel from "../models/bid.model.js";


const bidService = {
    async createBid(bid) {
        // check bidder
        const auction = await auctionModel.findById(bid.auction_id);

        bid.created_at = new Date();
        bid.amount = auction.current_price + auction.bid_step;

        return bidModel.createOne(bid);
    }
};

export default bidService;