import watchListModel from "../models/watch-list.model.js";
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

    // GET - /user/activity-bids
    getActivityBids(req, res, next) {
        try {
            res.render("user/activity-bids", {
                layout: "user-layout"
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
}

export default new UserController();