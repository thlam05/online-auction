import userRatingModel from "../models/user-rating.model.js";
import watchListModel from "../models/watch-list.model.js";
import auctionService from "../services/auction.service.js";
import bidService from "../services/bid.service.js";
import userRatingService from "../services/user-rating.service.js";
import userService from "../services/user.service.js";
import pendingUserModel from "../models/pending-user.model.js";
import userModel from "../models/user.model.js";

class UserController {
    getProfileInformation(req, res, next) {
        try {
            res.render("user/profile", {
                layout: "user-layout"
            });
        } catch (err) {
            next(err);
        }
    }

    async getReviews(req, res, next) {
        try {
            const id = req.session.passport.user.id
            const { listReviews, rating } = await userRatingService.getRatings(id);

            res.render("user/reviews", {
                layout: "user-layout",
                listReviews,
                rating
            });
        } catch (err) {
            next(err);
        }
    }

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

    async updateProfileInformation(req, res, next) {
        try {
            const { email, username, birthday, address } = req.body;
            const result = await userService.updateProfileInformation(req.user, { email, username, birthday, address });
            if (result.status == 0 || result.status == 3) {
                req.user.username = username;
                req.user.address = address;

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
            const result = await userService.updatePassword(req.user, { currentPassword, password, confirmPassword });
            req.user.password = result.data.password;
            req.user.updated_at = result.data.updated_at;
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }


    async showUpgrageSeller(req, res, next) {
        try {
            const user = req.session.passport.user;

            // Check if user is already a seller
            if (user.permission === 1) {
                return res.render("user/upgradeSeller", {
                    layout: "user-layout",
                    isAlreadySeller: true
                });
            }

            // Check if there's a pending request
            const pendingRequest = await pendingUserModel.findByUserId(user.id);

            res.render("user/upgradeSeller", {
                layout: "user-layout",
                hasPendingRequest: !!pendingRequest,
                pendingRequest: pendingRequest
            });
        } catch (err) {
            next(err);
        }
    }

    async requestUpgradeSeller(req, res, next) {
        try {
            const user = req.session.passport.user;
            const { reason } = req.body;

            // Check if user is already a seller
            if (user.permission === 1) {
                return res.status(400).json({
                    success: false,
                    message: "Bạn đã là người bán rồi"
                });
            }

            // Check if there's already a pending request
            const existingRequest = await pendingUserModel.findByUserId(user.id);
            if (existingRequest) {
                return res.status(400).json({
                    success: false,
                    message: "Bạn đã có yêu cầu đang chờ xử lý"
                });
            }

            // Create new pending request
            const expiredAt = new Date();
            expiredAt.setDate(expiredAt.getDate() + 7); // Expires in 7 days

            await pendingUserModel.createOne({
                user_id: user.id,
                email: user.email,
                message: reason,
                redirect_to: 'upgrade-seller',
                created_at: new Date(),
                expired_at: expiredAt
            });

            return res.json({
                success: true,
                message: "Yêu cầu nâng cấp đã được gửi thành công"
            });
        } catch (err) {
            next(err);
        }
    }


    async getMyAuctions(req, res, next) {
        try {
            const id = req.session.passport.user.id;
            const auctions = await auctionService.getAuctionBySellerId(id);
            const listRated = await userRatingService.getListRatedAuction(id);

            res.render("user/auctions-of-seller", {
                layout: "user-layout",
                auctions,
                listRated
            });
        } catch (err) {
            next(err);
        }
    }

    async getWinAutions(req, res, next) {
        try {
            const id = req.session.passport.user.id;
            const auctions = await auctionService.getAuctionsWon(id);

            const listRated = await userRatingService.getListRatedAuction(id);

            res.render("user/win-auctions", {
                layout: "user-layout",
                auctions,
                listRated
            });
        } catch (err) {
            next(err);
        }
    }

    async addRating(req, res, next) {
        try {
            const { id } = req.params;
            const { rating, auction_id, content } = req.body;
            const rater_id = req.session.passport.user.id;
            const user_rating = {
                rated_id: id,
                rater_id: rater_id,
                rating: rating,
                auction_id: auction_id,
                content: content
            }
            const newRating = await userRatingService.createOne(user_rating);
            res.json(newRating);
        } catch (err) {
            next(err);
        }
    }

    async getOtherUserReviews(req, res, next) {
        try {
            const { id } = req.params;
            const { listReviews, rating } = await userRatingService.getRatings(id);
            const isOther = true;
            const user = await userModel.findById(id);

            res.render("user/other-reviews", {
                listReviews,
                rating,
                isOther,
                user
            });
        } catch (err) {
            next(err);
        }
    }
}

export default new UserController();