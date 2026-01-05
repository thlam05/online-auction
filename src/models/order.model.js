import db from "../configs/db.config.js";

const orderModel = {
    createOne(order) {
        return db("orders").insert(order).returning("*");
    },

    findByAuctionId(auction_id) {
        return db("orders").where({ auction_id }).first();
    },

    findById(id) {
        return db("orders").where({ id }).first();
    },

    update(id, data) {
        return db("orders").where({ id }).update(data).returning("*");
    },

    findByBuyerId(buyer_id) {
        return db("orders")
            .where({ buyer_id })
            .orderBy("created_at", "desc");
    },

    findBySellerId(seller_id) {
        return db("orders")
            .where({ seller_id })
            .orderBy("created_at", "desc");
    }
};

export default orderModel;
