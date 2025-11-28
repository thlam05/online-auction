
class HomeController {
    // GET - /
    getHomePage(req, res, next) {
        try {
            res.render("home");
        } catch (err) {
            next(err);
        }
    }
}

export default new HomeController();