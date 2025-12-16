import userRatingModel from "../models/user-rating.model.js";

const userRatingService = {
    async createOne(user_rating) {
        user_rating.created_at = new Date();
        const newUserRating = await userRatingModel.createOne(user_rating);
        return newUserRating;
    },

    async getListRatedUser(user_id) {
        const list = await userRatingModel.getListRatedById(user_id);

        const result = list.map(function (item) {
            return item.rated_id;
        })

        return result;
    },

    async getListRatedAuction(user_id) {
        const list = await userRatingModel.getListRatedById(user_id);

        const result = list.map(function (item) {
            return item.auction_id;
        })

        return result;
    },

    async getRatings(user_id) {
        const listReviews = await userRatingModel.getRatingsByUserId(user_id);

        let count = 0;

        listReviews.forEach(function (item) {
            if (item.rating == '1') {
                count += 1;
            }
        })

        return {
            listReviews,
            rating: (count * 100 / listReviews.length)
        }

    }
}

export default userRatingService;