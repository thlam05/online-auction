import auctionService from "../services/auction.service.js";
import categoryService from "../services/category.service.js";
import auctionModel from "../models/auction.model.js";
import categoryModel from "../models/category.model.js";


class AuctionController {

    // GET - /auctions
    async getAllAuctions(req, res, next) {
        try {
            const categories = await categoryService.getAllCategory();

            const limit = req.query.limit || 6;
            const page = req.query.page || 1;
            const offset = (page - 1) * limit;

            const { count } = await auctionModel.countAllAuctions();
            const nPages = Math.ceil(+count / limit);
            const pageNumbers = [];
            for (let i = 1; i <= nPages; i++) {
                pageNumbers.push({
                    value: i,
                    isCurrent: i === +page,
                });
            }

            const prevPage = page > 1 ? page - 1 : 1;
            const nextPage = page < nPages ? page + 1 : nPages;

            const auctions = await auctionService.getAuctions(limit, offset);

            res.render("auctions/all-auctions", { categories, auctions, pageNumbers, prevPage, nextPage });
        } catch (err) {
            next(err);
        }
    }

    // GET - /auctions/categories/:category
    async getAuctionsByCategory(req, res, next) {
        try {
            const categories = await categoryService.getAllCategory();
            const category_slug = req.params.category;
            const category = await categoryModel.findBySlug(category_slug);

            const limit = req.query.limit || 6;
            const page = req.query.page || 1;
            const offset = (page - 1) * limit;

            const count = await auctionService.countAuctionsByCatId(category.id);
            const nPages = Math.ceil(+count / limit);
            const pageNumbers = [];
            for (let i = 1; i <= nPages; i++) {
                pageNumbers.push({
                    value: i,
                    isCurrent: i === +page,
                });
            }
            const prevPage = page > 1 ? page - 1 : 1;
            const nextPage = page < nPages ? page + 1 : nPages;

            const auctions = await auctionService.getAuctionByCatId(category.id, limit, offset);

            res.render("auctions/auctions-by-category", { curCategory: category_slug, categories, auctions, pageNumbers, prevPage, nextPage });
        } catch (err) {
            next(err);
        }
    }

    // GET - /auction/:id
    async getAuctionsById(req, res, next) {
        try {
            const { id } = req.params;
            const auction = await auctionService.getAuctionById(id);
            res.render("auctions/auction-by-id", { auction });
        } catch (err) {
            next(err);
        }
    }

    // GET /auctions/create
    async getCreateAuction(req, res, next) {
        try {
            const categories = await categoryService.getAllCategory();
            res.render("auctions/create-auction", { categories });
        } catch (err) {
            next(err);
        }
    }

    // GET - /auctions/search?
    async searchAuctions(req, res, next) {
        try {
            console.log(req.query);
            res.json({ message: "test" });
        } catch (err) {
            next(err);
        }
    }

    // POST /auctions
    async addAuction(req, res, next) {
        try {
            const sellerId = req.session.passport.user.id;
            const auction = req.body;
            const subImages = req.files.subImage;
            const [mainImage] = req.files.mainImage;

            await auctionService.createOne({ sellerId, ...auction, mainImage, subImages });
            res.redirect("/");
        } catch (err) {
            next(err);
        }
    }


}

export default new AuctionController();