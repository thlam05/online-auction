import auctionImageModel from "../models/auction-image.model.js";
import auctionModel from "../models/auction.model.js";
import bidModel from "../models/bid.model.js";
import categoryModel from "../models/category.model.js";
import userModel from "../models/user.model.js";
import userService from "./user.service.js";

const auctionService = {
    async createOne(data) {
        // data: {sellerId, categoryId, name, startingPrice, priceStep, costBuyNow, description, duration, mainImage, subImages}
        const auction = {
            seller_id: data.sellerId,
            category_id: data.categoryId,
            name: data.name,
            description: data.description,
            start_price: Number(data.startingPrice),
            current_price: Number(data.startingPrice),
            buy_now_price: Number(data.costBuyNow ? data.costBuyNow : 0),
            bid_step: Number(data.priceStep),
            start_at: new Date(Date.now()),
            end_at: new Date(Date.now() + data.duration * 60 * 60 * 1000),
            created_at: new Date(Date.now()),
            updated_at: new Date(Date.now())
        }

        const [newAuction] = await auctionModel.createOne(auction);

        let auctionImage = {
            auction_id: newAuction.id,
            url: "/uploads/" + data.mainImage.filename,
            is_main: true,
            index: 0,
            created_at: new Date(Date.now())
        }
        await auctionImageModel.createOne(auctionImage);

        await Promise.all(
            data.subImages.map(async (subImage, index) => {
                auctionImage = {
                    auction_id: newAuction.id,
                    url: "/uploads/" + subImage.filename,
                    is_main: false,
                    index: index + 1,
                    created_at: new Date(Date.now())
                }
                await auctionImageModel.createOne(auctionImage);
            })
        );
    },

    async getAllAuctions() {
        const auctions = await auctionModel.findAllWithRelations();
        return auctions || [];
    },

    async getAuctions(limit, offset) {
        const auctions = await auctionModel.findAuctionsWithRelations(limit, offset);
        return auctions || [];
    },

    async getAuctionByCatId(cat_id, limit, offset) {
        const auctions = await auctionModel.findAuctionsByCatWithRelations(cat_id, limit, offset);
        return auctions || [];
    },

    async getAuctionBySellerId(seller_id) {
        const auctions = await auctionModel.findBySellerIdWithRelations(seller_id);
        return auctions || [];
    },

    async countAuctionsByCatId(cat_id) {
        const category = await categoryModel.findById(cat_id);
        if (category.parent_category_id != null) {
            const { count } = await auctionModel.countAllAuctionsByCat(cat_id);
            return +count;
        }

        const subCategories = await categoryModel.findCategoiesLevel2(category.id);

        let listCount = await Promise.all(
            subCategories.map(cat => auctionModel.countAllAuctionsByCat(cat.id))
        );

        let total = 0;
        listCount.forEach(item => {
            total += +item.count;
        })

        return total;
    },

    async getAuctionByCatId(cat_id, limit, offset) {
        const category = await categoryModel.findById(cat_id);
        if (!category) return [];

        let categoryIds = [];

        if (category.parent_category_id !== null) {
            categoryIds = [cat_id];
        } else {
            const subCategories = await categoryModel.findCategoiesLevel2(category.id);

            if (subCategories.length === 0) {
                categoryIds = [cat_id];
            } else {
                categoryIds = subCategories.map(sc => sc.id);
            }
        }

        const auctions = await auctionModel.findAuctionsByCatIdsWithRelations(categoryIds, limit, offset);
        return auctions || [];
    },

    async getAuctionById(id) {
        const auction = await auctionModel.findById(id);

        const mainImage = await auctionImageModel.findMainByAuctionId(id);
        auction.mainImage = mainImage;
        const subImages = await auctionImageModel.findSubImageByAuctionId(id);
        auction.subImages = subImages;
        const seller = await userService.getUserById(auction.seller_id);
        auction.seller = seller;
        const tempHighestBidder = await bidModel.getHighestBidder(auction.id);
        if (tempHighestBidder != undefined) {
            const highestBidder = await userService.getUserById(tempHighestBidder.id);
            auction.highestBidder = highestBidder;
        } else {
            auction.highestBidder = undefined;
        }

        return auction;
    },

    async getTop5EndingSoon() {
        const auctions = await auctionModel.findTop5EndingSoonWithRelations();
        return auctions || [];
    },

    async getTop5MostBids() {
        const auctions = await auctionModel.findTop5MostBidsWithRelations();
        return auctions || [];
    },

    async getTop5HighestPrice() {
        const auctions = await auctionModel.findTop5HighestPriceWithRelations();
        return auctions || [];
    },


    async countAuctionByQuery(q) {
        const tsquery = q.trim().split(/\s+/).join("|");
        const { count } = await auctionModel.countAuctionsByQuery(tsquery);
        return +count;
    },

    async getAuctionByQuery(q, limit, offset, sort) {
        const tsquery = q.trim().split(/\s+/).join("|");
        let sortQuery = ["end_at", "decs"];
        if (sort) {
            sortQuery = sort.trim().split(/-+/);
        }

        const auctions = await auctionModel.findAuctionsByQueryWithRelations(tsquery, limit, offset, sortQuery);
        return auctions || [];
    },


    async appendDesAuction(auction, des) {
        const now = new Date();

        const date = now.toLocaleString("vi-VN", {
            hour12: false
        });

        const appendText = `
                <div><i class="bi bi-pencil-square pe-2"></i> [${date}]</div>
                ${des}
            `;

        auction.description = (auction.description || "") + appendText;

        const updatedAuction = await auctionModel.update(auction);
        return updatedAuction;
    },

    async getAuctionsWon(user_id) {
        const auctions = await auctionModel.findAuctionsWonWithRelations(user_id);
        return auctions || [];
    },

    async getSearchSuggestions(query, limit = 5) {
        const auctions = await auctionModel.searchAuctionsByName(query, limit);
        return auctions.map(auction => ({
            id: auction.id,
            name: auction.name,
            current_price: auction.current_price
        }));
    }
};

export default auctionService;