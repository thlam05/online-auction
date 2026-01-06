import auctionService from "../services/auction.service.js";
import categoryService from "../services/category.service.js";
import auctionModel from "../models/auction.model.js";
import categoryModel from "../models/category.model.js";
import bidService from "../services/bid.service.js";
import messageService from "../services/message.service.js";
import bidModel from "../models/bid.model.js";
import userService from "../services/user.service.js";
import userRatingService from "../services/user-rating.service.js";
import auctionBlockModel from "../models/auction-block.model.js";
import userModel from "../models/user.model.js";
import { sendBidSuccessToBidder, sendBidSuccessToPreHighestBidder, sendBidSuccessToSeller, sendInformBlocked } from "../utils/nodemailer.js";

const getPaginationData = (count, page, limit) => {
    const nPages = Math.ceil(+count / limit);
    const pageNumbers = [];
    for (let i = 1; i <= nPages; i++) {
        pageNumbers.push({
            value: i,
            isCurrent: i === +page,
        });
    }
    const prevPage = +page > 1 ? +page - 1 : 1;
    const nextPage = +page < nPages ? +page + 1 : nPages;
    return { nPages, pageNumbers, prevPage, nextPage };
}

class AuctionController {

    // GET - /auctions
    async getAllAuctions(req, res, next) {
        try {
            const categories = await categoryService.getAllCategory();

            const limit = req.query.limit || 6;
            const page = req.query.page || 1;
            const offset = (page - 1) * limit;

            const { count } = await auctionModel.countAllAuctions();
            const { nPages, pageNumbers, prevPage, nextPage } = getPaginationData(count, page, limit);

            const auctions = await auctionService.getAuctions(limit, offset);
            const empty = auctions.length == 0;

            auctions.forEach(auction => {
                auction.showBidder = true;
                auction.showDate = true;
                auction.showTags = true;
            });

            res.render("auctions/all-auctions", {
                empty,
                categories,
                auctions,
                pageNumbers,
                prevPage,
                nextPage,
                totalPages: nPages,
                currentPage: +page
            });
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
            const { nPages, pageNumbers, prevPage, nextPage } = getPaginationData(count, page, limit);

            const auctions = await auctionService.getAuctionByCatId(category.id, limit, offset);

            const empty = auctions.length == 0;

            auctions.forEach(auction => {
                auction.showBidder = true;
                auction.showDate = true;
            });

            res.render("auctions/auctions-by-category", {
                empty,
                curCategory: category,
                categories,
                auctions,
                pageNumbers,
                prevPage,
                nextPage,
                totalPages: nPages,
                currentPage: +page
            });
        } catch (err) {
            next(err);
        }
    }

    // GET - /auction/:id
    async getAuctionsById(req, res, next) {
        try {
            const { id } = req.params;
            const auction = await auctionService.getAuctionById(id);
            if (auction && res.locals.isAuthenticated) {
                const auctionEnded = new Date(auction.end_at) <= new Date();

                if (auctionEnded) {
                    const userId = res.locals.authUser.id;
                    const winner = await bidModel.getHighestBidder(id);

                    if (winner && (auction.seller_id === userId || winner.id === userId)) {
                        return res.redirect(`/payment/${id}`);
                    }
                }
            }

            const messages = await messageService.getAllMessageByAuctionId(id);
            const relateAuctons = await auctionModel.findRelateAuctions(auction.category_id);
            const bidHistories = await bidModel.getBidHistory(id);
            let listReview, rating;
            if (res.locals.isAudenticated) {
                const { t_listReview, t_rating } = await userRatingService.getRatings(res.locals.authUser.id);
                listReview = t_listReview;
                rating = t_rating;
            }
            let bidderBlocked = await auctionBlockModel.getBidderBlocked(id);
            bidderBlocked = bidderBlocked.map((block) => {
                return block.user_id;
            })
            let bidders = await bidModel.getBidders(id);
            bidders = await Promise.all(
                bidders.map(async bidder => {
                    const { listReview, rating } =
                        await userRatingService.getRatings(bidder.bidder_id);
                    const total_bids = await bidModel.countBidOfBidder(id, bidder.bidder_id);
                    return {
                        ...bidder,
                        listReview,
                        rating,
                        total_bids
                    };
                })
            );

            res.render("auctions/auction-by-id", { auction, messages, relateAuctons, bidHistories, rating, bidders, bidderBlocked });
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
            const { nPages, pageNumbers, prevPage, nextPage } = getPaginationData(count, page, limit);

            const auctions = await auctionService.getAuctionByQuery(q, limit, offset, sort);

            const empty = auctions.length == 0;

            // Add display flags for product card
            auctions.forEach(auction => {
                auction.showBidder = true;
                auction.showDate = true;
            });

            const qSearch = q.trim().split(/\s+/).join("+");

            res.render("auctions/search", {
                empty,
                categories,
                auctions,
                pageNumbers,
                prevPage,
                nextPage,
                qSearch,
                totalPages: nPages,
                currentPage: +page
            });
        } catch (err) {
            next(err);
        }
    }

    // GET - /auctions/search/suggestions
    async getSearchSuggestions(req, res, next) {
        try {
            const { q } = req.query;
            if (!q || q.trim().length < 2) {
                return res.json({ suggestions: [] });
            }

            const suggestions = await auctionService.getSearchSuggestions(q.trim(), 5);
            return res.json({ suggestions });
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

            // Return JSON for AJAX
            return res.json({
                success: true,
                message: {
                    id: result.id,
                    content: content,
                    sender_name: req.session.passport.user.username,
                    created_at: new Date(),
                    reply_id: reply_id || null
                }
            });
        } catch (err) {
            next(err);
        }
    }


    // POST - /auctions/:id/bids
    async bidAuctions(req, res, next) {
        try {
            const { id } = req.params;
            const { max_price, expected_price } = req.body;
            const bidder_id = req.session.passport.user.id;

            const data = { auction_id: id, max_price: Number(max_price), bidder_id };
            const expectedCurrentPrice = expected_price ? Number(expected_price) : null;

            const preBidder = await bidModel.getHighestBidder(id);

            const result = await bidService.createBid(data, expectedCurrentPrice);

            if (!result.success) {
                const highestBidder = await bidModel.getHighestBidder(id);
                const latestBids = await bidModel.getBidHistory(id);
                const recentBids = latestBids.slice(0, 10).map(bid => ({
                    amount: bid.amount,
                    created_at: bid.created_at,
                    bidder_name: bid.bidder_name
                }));

                return res.json({
                    success: false,
                    error: result.error,
                    message: result.message,
                    auction: {
                        current_price: result.currentPrice,
                        highest_bidder: highestBidder ? {
                            username: highestBidder.username,
                            rating: highestBidder.rating
                        } : null
                    },
                    newBids: recentBids
                });
            }

            const highestBidder = await bidModel.getHighestBidder(id);

            const latestBids = await bidModel.getBidHistory(id);
            const newBidsForHistory = latestBids.slice(0, result.newBids.length).map(bid => ({
                amount: bid.amount,
                created_at: bid.created_at,
                bidder_name: bid.bidder_name
            }));

            return res.json({
                success: true,
                message: "Đặt giá thành công!",
                auction: {
                    current_price: result.currentPrice,
                    end_at: result.auction.end_at,
                    highest_bidder: highestBidder ? {
                        username: highestBidder.username,
                        rating: highestBidder.rating
                    } : null
                },
                newBids: newBidsForHistory
            });
        } catch (err) {
            next(err);
        }
    }

    // POST - /auctions/:id/buy-now
    async buyNow(req, res, next) {
        try {
            const { id } = req.params;
            const bidder_id = req.session.passport.user.id;

            const result = await bidService.buyNow(id, bidder_id);

            if (!result.success) {
                return res.json({
                    success: false,
                    error: result.error,
                    message: result.message
                });
            }

            return res.json({
                success: true,
                message: result.message,
                redirectUrl: `/payment/${id}`
            });
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

    // AJAX API - GET /auctions/data
    async getAuctionsData(req, res, next) {
        try {
            const limit = req.query.limit || 6;
            const page = req.query.page || 1;
            const offset = (page - 1) * limit;
            const search = req.query.search || '';

            let auctions;
            let count;

            if (search) {
                // Search functionality
                const result = await auctionModel.searchAuctions(search, limit, offset);
                auctions = result.auctions;
                count = result.count;
            } else {
                auctions = await auctionService.getAuctions(limit, offset);
                const countResult = await auctionModel.countAllAuctions();
                count = countResult.count;
            }

            auctions.forEach(auction => {
                auction.showBidder = true;
                auction.showDate = true;
                auction.showTags = true;
            });

            const totalPages = Math.ceil(+count / limit);

            // Render using Handlebars
            res.render('partials/auction-cards', {
                layout: false,
                auctions
            }, (err, html) => {
                if (err) {
                    return next(err);
                }
                res.json({ html, totalPages, currentPage: +page });
            });
        } catch (err) {
            next(err);
        }
    }

    // AJAX API - GET /auctions/category/:category/data
    async getAuctionsByCategoryData(req, res, next) {
        try {
            const { category } = req.params;
            const limit = req.query.limit || 6;
            const page = req.query.page || 1;
            const offset = (page - 1) * limit;

            const curCategory = await categoryModel.findCategoryBySlug(category);
            if (!curCategory) {
                return res.status(404).json({ error: 'Category not found' });
            }

            const { count } = await auctionModel.countByCategoryID(curCategory.id);
            const auctions = await auctionService.getAuctionsByCategoryID(curCategory.id, limit, offset);

            auctions.forEach(auction => {
                auction.showBidder = true;
                auction.showDate = true;
                auction.showTags = true;
            });

            const totalPages = Math.ceil(+count / limit);

            // Render using Handlebars
            res.render('partials/auction-cards', {
                layout: false,
                auctions
            }, (err, html) => {
                if (err) {
                    return next(err);
                }
                res.json({ html, totalPages, currentPage: +page });
            });
        } catch (err) {
            next(err);
        }
    }

    // AJAX API - GET /auctions/search/data
    async searchAuctionsData(req, res, next) {
        try {
            const query = req.query.q || req.query.search || '';
            const limit = req.query.limit || 6;
            const page = req.query.page || 1;
            const offset = (page - 1) * limit;

            const { auctions, count } = await auctionModel.searchAuctions(query, limit, offset);

            auctions.forEach(auction => {
                auction.showBidder = true;
                auction.showDate = true;
                auction.showTags = true;
            });

            const totalPages = Math.ceil(+count / limit);

            // Render using Handlebars
            res.render('partials/auction-cards', {
                layout: false,
                auctions
            }, (err, html) => {
                if (err) {
                    return next(err);
                }
                res.json({ html, totalPages, currentPage: +page });
            });
        } catch (err) {
            next(err);
        }
    }

    // POST - /auctions/:id/block-bidder
    async blockBidder(req, res, next) {
        try {
            const { bidder_id } = req.body;
            const { id } = req.params;

            const auctionBlock = {
                user_id: bidder_id,
                auction_id: id,
            }

            const auction = await auctionService.handleBlockBidder(auctionBlock);
            const bidder = await userModel.findById(bidder_id);

            await sendInformBlocked(auction, bidder);

            res.redirect(`/auctions/${id}`);
        } catch (err) {
            next(err);
        }
    }
}

export default new AuctionController();