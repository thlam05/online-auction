import db from "../configs/db.config.js";

const orderMessageModel = {
    createOne(message) {
        return db("order_messages").insert(message).returning("*");
    },

    getByOrderId(order_id) {
        return db("order_messages as m")
            .leftJoin("users as u", "u.id", "m.sender_id")
            .where("m.order_id", order_id)
            .select("m.*", "u.username as sender_name")
            .orderBy("m.created_at", "asc");
    },

    getRecentByOrderId(order_id, limit = 50) {
        return db("order_messages as m")
            .leftJoin("users as u", "u.id", "m.sender_id")
            .where("m.order_id", order_id)
            .select("m.*", "u.username as sender_name")
            .orderBy("m.created_at", "desc")
            .limit(limit);
    }
};

export default orderMessageModel;
