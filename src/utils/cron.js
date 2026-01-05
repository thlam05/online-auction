import nodeCron from "node-cron";
import auctionModel from "../models/auction.model.js";
import bidModel from "../models/bid.model.js";
import userModel from "../models/user.model.js";
import { sendAuctionEndedNoBidToSeller, sendAuctionEndedToSeller, sendAuctionEndedToWinner } from "../utils/nodemailer.js";

export function handleEndedAuction() {
    nodeCron.schedule("* * * * *", async () => {
        const auctions = await auctionModel.findExpired();

        await Promise.all(
            auctions.map(async (auction) => {
                try {
                    const seller = await userModel.findById(auction.seller_id);
                    const bidder = await bidModel.getHighestBidder(auction.id);

                    const mails = [];

                    if (!bidder) {
                        mails.push(sendAuctionEndedNoBidToSeller(auction, seller));
                    } else {
                        mails.push(sendAuctionEndedToSeller(auction, seller));
                        mails.push(sendAuctionEndedToWinner(auction, bidder));
                    }

                    await Promise.all(mails);

                    await auctionModel.update({
                        id: auction.id,
                        is_informed: true,
                        updated_at: new Date(),
                    });
                } catch (err) {
                    console.error(`Auction ${auction.id} failed`, err);
                }
            })
        );
    });
}