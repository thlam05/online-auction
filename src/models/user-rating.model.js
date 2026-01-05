import db from "../configs/db.config.js";

const userRatingModel = {
    createOne(rating) {
        return db("user_ratings").insert(rating).returning("*");
    },

    update(id, data) {
        return db("user_ratings").where({ id }).update(data).returning("*");
    },

    findByRaterAndAuction(rater_id, auction_id) {
        return db("user_ratings")
            .where({ rater_id, auction_id })
            .first();
    },

    getListRatedById(user_id) {
        return db("user_ratings").where({ rater_id: user_id });
    },

    getRatingsByUserId(user_id) {
        return db("user_ratings AS ur")
            .join("users AS u", "u.id", "ur.rater_id")
            .where("ur.rated_id", user_id)
            .select("ur.*", "u.username as rater_name")
            .orderBy("ur.created_at", "desc");
    },

    getListAuctionsRated(user_id) {
        return db("user_ratings").where({ rater_id: user_id });
    }
}

export default userRatingModel;