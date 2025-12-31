import categoryModel from "../models/category.model.js";
import auctionService from "../services/auction.service.js";

class HomeController {
    // GET - /
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

            // Add badge data to auctions
            top5EndingSoon.forEach(auction => {
                auction.badgeType = "danger";
                auction.badgeText = "Sắp kết thúc";
            });

            top5MostBids.forEach(auction => {
                auction.badgeType = "warning";
                auction.badgeText = "Hot";
            });

            top5HighestPrice.forEach(auction => {
                auction.badgeType = "success";
                auction.badgeText = "Premium";
            });

            res.render("home", { listCategories, top5EndingSoon, top5MostBids, top5HighestPrice });
        } catch (err) {
            next(err);
        }
    }
}

export default new HomeController();