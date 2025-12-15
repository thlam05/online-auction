import db from "../configs/db.config.js";

const bidModel = {
    createOne(bid) {
        return db("bids").insert(bid).returning("*");
    },

    getHighestBidder(auction_id) {
        return db("bids AS b")
            .join("users AS u", "u.id", "b.bidder_id")
            .where("b.auction_id", auction_id)
            .select("u.*", "b.amount as bid_amount")
            .orderBy("b.amount", "desc")
            .first();
    }
}

export default bidModel;