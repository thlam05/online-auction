import db from "../configs/db.config.js";

const bidModel = {
    createOne(bid) {
        const { id, ...data } = bid;
        return db("bids").insert(data).returning("*");
    },

    async countBib(auction_id) {
        const result = await db("bids")
            .where("auction_id", auction_id)
            .count("id as total");

        return Number(result[0].total);
    },

    getHighestBidder(auction_id) {
        return db("bids AS b")
            .join("users AS u", "u.id", "b.bidder_id")
            .where("b.auction_id", auction_id)
            .select("u.*", "b.amount as bid_amount")
            .orderBy("b.amount", "desc")
            .first();
    },

    getHighestBid(auction_id) {
        return db("bids")
            .where("auction_id", auction_id)
            .orderBy("amount", "desc")
            .first();
    },

    getBidHistory(auction_id) {
        return db("bids as b")
            .join("users AS u", "u.id", "b.bidder_id")
            .where("b.auction_id", auction_id)
            .select("b.*", "u.username as bidder_name")
            .orderBy("b.created_at", "desc")
    },

    getBidByUserId(user_id) {
        return db("bids as b")
            .join("auctions as a", "a.id", "b.auction_id")
            .where("b.bidder_id", user_id)
            .select("a.*", "b.max_price as max_price")
            .orderBy("b.created_at", "desc")
    }
}

export default bidModel;