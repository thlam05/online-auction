import db from "../configs/db.config.js";

const userRatingModel = {
    createOne(rating) {
        return db("user_ratings").insert(rating).returning("*");
    },

    getRatings() {

    }
}

export default userRatingModel;