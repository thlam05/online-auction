import auctionModel from "../models/auction.model.js";
import bidModel from "../models/bid.model.js";
import auctionImageModel from "../models/auction-image.model.js"

const bidService = {
    async createBid(bid, expectedCurrentPrice = null) {
        const auction = await auctionModel.findById(bid.auction_id);

        if (expectedCurrentPrice !== null && auction.current_price !== expectedCurrentPrice) {
            return {
                success: false,
                error: 'PRICE_CHANGED',
                message: 'Có người đã đặt giá cao hơn. Vui lòng đặt lại!',
                currentPrice: auction.current_price,
                auction
            };
        }

        const minBid = auction.current_price + auction.bid_step;
        if (bid.max_price < minBid) {
            return {
                success: false,
                error: 'BID_TOO_LOW',
                message: `Giá đặt phải tối thiểu ${minBid.toLocaleString('vi-VN')} VNĐ`,
                currentPrice: auction.current_price,
                auction
            };
        }

        const highestBid = await bidModel.getHighestBid(auction.id);
        const bidsToInsert = [];

        if (!highestBid) {
            bid.amount = auction.current_price + auction.bid_step;
            bid.created_at = new Date();
            bidsToInsert.push({ ...bid });
            auction.current_price = bid.amount;
        } else {
            let currentPrice = auction.current_price;
            let isNewBidTurn = true;

            while (
                (bid.max_price >= currentPrice + auction.bid_step) &&
                (highestBid.max_price >= currentPrice + auction.bid_step)
            ) {
                currentPrice += auction.bid_step;
                if (isNewBidTurn) {
                    bidsToInsert.push({
                        auction_id: bid.auction_id,
                        bidder_id: bid.bidder_id,
                        max_price: bid.max_price,
                        amount: currentPrice,
                        created_at: new Date()
                    });
                } else {
                    bidsToInsert.push({
                        auction_id: highestBid.auction_id,
                        bidder_id: highestBid.bidder_id,
                        max_price: highestBid.max_price,
                        amount: currentPrice,
                        created_at: new Date()
                    });
                }
                isNewBidTurn = !isNewBidTurn;
            }

            if (bid.max_price > highestBid.max_price && bid.max_price >= currentPrice + auction.bid_step) {
                currentPrice += auction.bid_step;
                bidsToInsert.push({
                    auction_id: bid.auction_id,
                    bidder_id: bid.bidder_id,
                    max_price: bid.max_price,
                    amount: currentPrice,
                    created_at: new Date()
                });
            } else if (highestBid.max_price > bid.max_price && highestBid.max_price >= currentPrice + auction.bid_step) {
                currentPrice += auction.bid_step;
                bidsToInsert.push({
                    auction_id: highestBid.auction_id,
                    bidder_id: highestBid.bidder_id,
                    max_price: highestBid.max_price,
                    amount: currentPrice,
                    created_at: new Date()
                });
            }

            auction.current_price = currentPrice;
        }

        if (bidsToInsert.length > 0) {
            await bidModel.createMany(bidsToInsert);
        }

        // Check if buy_now_price is reached - end auction immediately
        let buyNowTriggered = false;
        if (auction.buy_now_price && auction.buy_now_price > 0 && auction.current_price >= auction.buy_now_price) {
            auction.end_at = new Date(); // End auction now
            buyNowTriggered = true;
        } else {
            // Auto extend time logic
            const time = new Date(auction.end_at);
            const now = new Date();
            const diffMs = now - time;
            const diffMinutes = diffMs / (1000 * 60);

            if (diffMinutes <= 5 && diffMinutes >= 0) {
                auction.end_at = new Date(time.getTime() + 10 * 60 * 1000);
            }
        }
        await auctionModel.update(auction);

        const lastBid = bidsToInsert[bidsToInsert.length - 1];
        return {
            success: true,
            bid: lastBid,
            currentPrice: auction.current_price,
            newBids: bidsToInsert,
            auction,
            buyNowTriggered
        };
    },

    async buyNow(auction_id, bidder_id) {
        const auction = await auctionModel.findById(auction_id);

        if (!auction) {
            return { success: false, error: 'NOT_FOUND', message: 'Không tìm thấy sản phẩm' };
        }

        if (new Date(auction.end_at) <= new Date()) {
            return { success: false, error: 'ENDED', message: 'Đấu giá đã kết thúc' };
        }

        if (!auction.buy_now_price || auction.buy_now_price <= 0) {
            return { success: false, error: 'NO_BUY_NOW', message: 'Sản phẩm không hỗ trợ mua ngay' };
        }

        if (auction.seller_id === bidder_id) {
            return { success: false, error: 'OWN_AUCTION', message: 'Bạn không thể mua sản phẩm của chính mình' };
        }

        // Create bid with buy_now_price
        const bid = {
            auction_id,
            bidder_id,
            max_price: auction.buy_now_price,
            amount: auction.buy_now_price,
            created_at: new Date()
        };

        await bidModel.createOne(bid);

        // End auction immediately
        auction.current_price = auction.buy_now_price;
        auction.end_at = new Date();
        await auctionModel.update(auction);

        return {
            success: true,
            message: 'Mua ngay thành công!',
            auction
        };
    },

    async getBidsByUserId(user_id) {
        const auctions = await bidModel.getBidByUserId(user_id);
        await Promise.all(
            auctions.map(async (auction) => {
                const mainImage = await auctionImageModel.findMainByAuctionId(auction.id);
                auction.mainImage = mainImage;
            })
        );
        return auctions;
    }
};

export default bidService;