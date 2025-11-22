
class HomeController {
    // GET - /
    getHomePage(req, res, next) {
        res.render("home");
    }
}

export default new HomeController();