import categoryModel from "../models/category.model.js";
import auctionService from "../services/auction.service.js";
import categoryService from "../services/category.service.js";

class HomeController {
    // GET - /
    async getHomePage(req, res, next) {
        try {
            const listCategories = await categoryModel.findCategoriesLevel1();
            const top5EndingSoon = await auctionService.getTop5EndingSoon();
            const top5MostBids = await auctionService.getTop5MostBids();
            const top5HighestPrice = await auctionService.getTop5HighestPrice();

            res.render("home", { listCategories, top5EndingSoon, top5MostBids, top5HighestPrice });
        } catch (err) {
            next(err);
        }
    }
}

export default new HomeController();