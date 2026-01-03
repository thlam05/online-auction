import db from "../configs/db.config.js";

const auctionBlockModel = {
    createOne(auctionBlock) {
        return db("auction_block").insert(auctionBlock).returning("*");
    },

    getBidderBlocked(auction_id) {
        return db("auction_block").where("auction_id", auction_id).select("user_id");
    }
}

export default auctionBlockModel;