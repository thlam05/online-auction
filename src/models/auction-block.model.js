import db from "../configs/db.config.js";

const auctionBlockModel = {
    createOne(auctionBlock) {
        return db("auction_block").insert(auctionBlock).returning("*");
    }
}

export default auctionBlockModel;