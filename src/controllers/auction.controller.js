import auctionService from "../services/auction.service.js";
import categoryService from "../services/category.service.js";
import auctionModel from "../models/auction.model.js";
import categoryModel from "../models/category.model.js";
import bidService from "../services/bid.service.js";
import messageService from "../services/message.service.js";
import bidModel from "../models/bid.model.js";


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
            const empty = auctions.length == 0;

            res.render("auctions/all-auctions", { empty, categories, auctions, pageNumbers, prevPage, nextPage });
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

            const empty = auctions.length == 0;

            res.render("auctions/auctions-by-category", { empty, curCategory: category, categories, auctions, pageNumbers, prevPage, nextPage });
        } catch (err) {
            next(err);
        }
    }

    // GET - /auction/:id
    async getAuctionsById(req, res, next) {
        try {
            const { id } = req.params;
            const auction = await auctionService.getAuctionById(id);
            const messages = await messageService.getAllMessageByAuctionId(id);
            const relateAuctons = await auctionModel.findRelateAuctions(auction.category_id);
            const bidHistories = await bidModel.getBidHistory(id);
            res.render("auctions/auction-by-id", { auction, messages, relateAuctons, bidHistories });
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
            const categories = await categoryService.getAllCategory();
            const { q, sort } = req.query;
            if (!q) {
                return res.render("auctions/search", { categories, empty: true });
            }

            const limit = req.query.limit || 6;
            const page = req.query.page || 1;
            const offset = (page - 1) * limit;

            const count = await auctionService.countAuctionByQuery(q);
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

            const auctions = await auctionService.getAuctionByQuery(q, limit, offset, sort);

            const empty = auctions.length == 0;

            const qSearch = q.trim().split(/\s+/).join("+");

            res.render("auctions/search", { empty, categories, auctions, pageNumbers, prevPage, nextPage, qSearch });
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


    // POST - /auctions/:id/messages
    async sendMessage(req, res, next) {
        try {
            const { id } = req.params;
            const auction = await auctionModel.findById(id);
            const { content, reply_id } = req.body;

            const message = {
                auction_id: id,
                sender_id: req.session.passport.user.id,
                receiver_id: auction.seller_id,
                content: content,
                reply_id: reply_id || null
            }

            const result = await messageService.createOne(message, auction);

            res.redirect(`/auctions/${id}`);
        } catch (err) {
            next(err);
        }
    }


    // POST - /auctions/:id/bids
    async bidAuctions(req, res, next) {
        try {
            const { id } = req.params;
            const { max_price } = req.body;
            const bidder_id = req.session.passport.user.id;

            const data = { auction_id: id, max_price, bidder_id };
            const bid = await bidService.createBid(data);
            res.redirect(`/auctions/${id}`);
        } catch (err) {
            next(err);
        }
    }


    // GET - /auctions/edit/:id
    async getEditAuctions(req, res, next) {
        try {
            const { id } = req.params;
            const auction = await auctionModel.findById(id);
            res.render("auctions/edit-auction", { auction });
        } catch (err) {
            next(err);
        }
    }

    // POST - /auctions/edit
    async updateDesAuction(req, res, next) {
        try {
            const { auction_id, description } = req.body;
            const auction = await auctionModel.findById(auction_id);

            const updateAuction = await auctionService.appendDesAuction(auction, description);
            res.redirect("/user/auctions");
        } catch (err) {
            next(err);
        }
    }

}

export default new AuctionController();