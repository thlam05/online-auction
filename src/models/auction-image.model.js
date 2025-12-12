import db from "../configs/db.config.js";

const auctionImageModel = {
    createOne(auctionImage) {
        return db("auction_images").insert(auctionImage).returning("*");
    },

    findMainByAuctionId(auction_id) {
        return db("auction_images").where({ auction_id: auction_id, is_main: true }).first();
    },

    findSubImageByAuctionId(auction_id) {
        return db("auction_images").where({ auction_id: auction_id, is_main: false });
    }
}

export default auctionImageModel;