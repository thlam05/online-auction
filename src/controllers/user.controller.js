

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
}

export default new UserController();