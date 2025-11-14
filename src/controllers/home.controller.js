
class HomeController {
    // GET - /
    showHomePage(req, res, next) {
        res.render("home");
    }
}

export default new HomeController();