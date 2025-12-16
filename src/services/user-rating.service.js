import userRatingModel from "../models/user-rating.model.js";

const userRatingService = {
    async createOne(user_rating) {
        user_rating.created_at = new Date();
        const newUserRating = await userRatingModel.createOne(user_rating);
        return newUserRating;
    },
}

export default userRatingService;