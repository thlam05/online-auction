import categoryModel from "../models/category.model.js";
import auctionService from "../services/auction.service.js";

class HomeController {
    async getHomePage(req, res, next) {
        try {
            const [
                listCategories,
                top5EndingSoon,
                top5MostBids,
                top5HighestPrice
            ] = await Promise.all([
                categoryModel.findCategoriesLevel1(),
                auctionService.getTop5EndingSoon(),
                auctionService.getTop5MostBids(),
                auctionService.getTop5HighestPrice()
            ]);

            res.render("home", { listCategories, top5EndingSoon, top5MostBids, top5HighestPrice });
        } catch (err) {
            next(err);
        }
    }
}

export default new HomeController();