import auctionModel from "../models/auction.model.js";
import bidModel from "../models/bid.model.js";
import auctionImageModel from "../models/auction-image.model.js"

const bidService = {
    async createBid(bid) {
        // check bidder
        const auction = await auctionModel.findById(bid.auction_id);

        if (bid.amount < auction.current_price + auction.bid_step) {
            return null;
        }

        const highestBid = await bidModel.getHighestBid(auction.id);

        if (!highestBid) {
            bid.created_at = new Date();
            bid.amount = auction.current_price + auction.bid_step;
            auction.current_price = bid.amount;
        } else {
            bid.created_at = new Date();
            bid.amount = highestBid.amount + auction.bid_step;
            auction.current_price = bid.amount;
        }

        await auctionModel.update(auction);

        return bidModel.createOne(bid);
    },

    async getBidsByUserId(user_id) {
        const auctions = await bidModel.getBidByUserId(user_id);
        await Promise.all(
            auctions.map(async function (auction) {
                const mainImage = await auctionImageModel.findMainByAuctionId(auction.id);
                auction.mainImage = mainImage;
            })
        );
        return auctions;
    }
};

export default bidService;