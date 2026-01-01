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
        }
        else {
            while (bid.max_price >= auction.current_price + auction.bid_step && highestBid.max_price >= auction.current_price + auction.bid_step) {
                if (bid.max_price >= auction.current_price + auction.bid_step) {
                    bid.amount = auction.current_price + auction.bid_step;
                    bid.created_at = new Date();
                    await bidModel.createOne(bid);
                    auction.current_price += auction.bid_step;
                }
                if (highestBid.max_price >= auction.current_price + auction.bid_step) {
                    highestBid.amount = auction.current_price + auction.bid_step;
                    highestBid.created_at = new Date();
                    await bidModel.createOne(highestBid);
                    auction.current_price += auction.bid_step;
                }
            }
        }

        const time = new Date(auction.end_at);
        const now = new Date();

        const diffMs = now - time;
        const diffMinutes = diffMs / (1000 * 60);

        if (diffMinutes <= 5 && diffMinutes >= 0) {
            auction.end_at = new Date(time.getTime() + 10 * 60 * 1000);
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