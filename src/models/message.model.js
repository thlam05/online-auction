import db from "../configs/db.config.js"

const messageModel = {

    createOne(message) {
        return db("messages").insert(message).returning("*");
    },

    getMessageLevel1ByAuctionId(auction_id) {
        return db("messages").where({ reply_id: null, auction_id: auction_id });
    },

    getMessageLevel2(message_id) {
        return db("messages as m")
            .leftJoin("users as s", "s.id", "m.sender_id")
            .leftJoin("users as r", "r.id", "m.receiver_id")
            .where("m.reply_id", message_id)
            .select(
                "m.*",
                "s.username as sender_name",
                "r.username as receiver_name"
            )
            .orderBy("m.created_at", "desc");
    },


    getAllByAuctionId(auction_id) {
        return db("messages as m")
            .leftJoin("users as s", "s.id", "m.sender_id")
            .leftJoin("users as r", "r.id", "m.receiver_id")
            .where("m.auction_id", auction_id)
            .select(
                "m.*",
                "s.username as sender_name",
                "r.username as receiver_name"
            )
            .orderBy("m.created_at", "desc");
    }
};

export default messageModel;