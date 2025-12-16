import watchListModel from "../models/watch-list.model.js";
import auctionService from "../services/auction.service.js";
import bidService from "../services/bid.service.js";
import userRatingService from "../services/user-rating.service.js";
import userService from "../services/user.service.js";

class UserController {
    // GET - /user/profile
    getProfileInformation(req, res, next) {
        try {
            res.render("user/profile", {
                layout: "user-layout"
            });
        } catch (err) {
            next(err);
        }
    }

    // GET - /user/reviews
    getReviews(req, res, next) {
        try {

            res.render("user/reviews", {
                layout: "user-layout"
            });
        } catch (err) {
            next(err);
        }
    }

    // GET - /user/watch-list
    async getWatchList(req, res, next) {
        try {
            const watchlists = await watchListModel.getWatchListByUserId(req.session.passport.user.id);
            res.render("user/watch-list", {
                layout: "user-layout",
                watchlists: watchlists
            });
        } catch (err) {
            next(err);
        }
    }

    // GET - /user/bids
    async getBids(req, res, next) {
        try {
            const id = req.session.passport.user.id;
            const auctions = await bidService.getBidsByUserId(id);

            res.render("user/bids", {
                layout: "user-layout",
                auctions
            });
        } catch (err) {
            next(err);
        }
    }

    // PATHC - /user/profile
    async updateProfileInformation(req, res, next) {
        try {
            const { email, username, birthday, address } = req.body;
            const result = await userService.updateProfileInformation(req.session.passport.user, { email, username, birthday, address });
            if (result.status == 0 || result.status == 3) {
                req.session.passport.user.username = username;
                req.session.passport.user.address = address;

                if (result.status == 3) {
                    return res.json({
                        status: result.status,
                        redirectUrl: `/auth/otp-verify?email=${result.data.email}&pendingUserId=${result.data.id}`
                    })
                }
            }
            return res.json(result);
        } catch (err) {
            next(err);
        }
    }

    async changePassword(req, res, next) {
        try {
            const { currentPassword, password, confirmPassword } = req.body;
            const result = await userService.updatePassword(req.session.passport.user, { currentPassword, password, confirmPassword });
            req.session.passport.user.password = result.data.password;
            req.session.passport.user.updated_at = result.data.updated_at;
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }


    // GET - /user/upgrade-seller
    async showUpgrageSeller(req, res, next) {
        try {
            res.render("user/upgradeSeller", {
                layout: "user-layout"
            });
        } catch (err) {
            next(err);
        }
    }


    // GET - /user/auctions
    async getMyAuctions(req, res, next) {
        try {
            const id = req.session.passport.user.id;
            const auctions = await auctionService.getAuctionBySellerId(id);

            res.render("user/auctions-of-seller", {
                layout: "user-layout",
                auctions
            });
        } catch (err) {
            next(err);
        }
    }

    async getWinAutions(req, res, next) {
        try {
            const id = req.session.passport.user.id;
            const auctions = await auctionService.getAuctionsWon(id);

            res.render("user/win-auctions", {
                layout: "user-layout",
                auctions
            });
        } catch (err) {
            next(err);
        }
    }

    // POST - user/ratings/:id
    async addRating(req, res, next) {
        try {
            const { id } = req.params;
            const { rating, auction_id } = req.body;
            const rater_id = req.session.passport.user.id;
            const user_rating = {
                rated_id: id,
                rater_id: rater_id,
                rating: rating,
                auction_id: auction_id
            }
            const newRating = await userRatingService.createOne(user_rating);
            res.json(newRating);
        } catch (err) {
            next(err);
        }
    }
}

export default new UserController();