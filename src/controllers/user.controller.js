import userService from "../services/user.service.js";

class UserController {
    // GET - /user/profile
    getProfileInformation(req, res, next) {
        res.render("user/profile", {
            layout: "user-layout"
        });
    }

    // GET - /user/reviews
    getReviews(req, res, next) {
        res.render("user/reviews", {
            layout: "user-layout"
        });
    }

    // GET - /user/watch-list
    getWatchList(req, res, next) {
        res.render("user/watch-list", {
            layout: "user-layout"
        });
    }

    // GET - /user/activity-bids
    getActivityBids(req, res, next) {
        res.render("user/activity-bids", {
            layout: "user-layout"
        });
    }

    // PATHC - /user/profile
    async updateProfileInformation(req, res, next) {
        const { email, username, address } = req.body;
        const result = await userService.updateProfileInformation(req.session.passport.user, { email, username, address });
        if(result.status === 0 || result.status ===3) {
            req.session.passport.user.email = email;
            req.session.passport.user.username = username;
            req.session.passport.user.address = address;
        }
        if(result.status === 3) {
            
        }
        return res.json(result);
    }
}

export default new UserController();