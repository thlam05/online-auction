import auctionBlockModel from "../models/auction-block.model.js";
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
        const auctions = await auctionModel.findAll();
        if (!auctions) {
            return [];
        }

        await Promise.all(
            auctions.map(async function (auction) {
                const category = await categoryModel.findById(auction.category_id);
                auction.category = category;
                const seller = await userModel.findById(auction.seller_id);
                auction.seller = seller;
                const mainImage = await auctionImageModel.findMainByAuctionId(auction.id);
                auction.mainImage = mainImage;
            })
        );

        return auctions;
    },

    async getAuctions(limit, offset) {
        const auctions = await auctionModel.findAuctions(limit, offset);
        if (!auctions) {
            return [];
        }

        await Promise.all(
            auctions.map(async function (auction) {
                const category = await categoryModel.findById(auction.category_id);
                auction.category = category;
                const seller = await userModel.findById(auction.seller_id);
                auction.seller = seller;
                const mainImage = await auctionImageModel.findMainByAuctionId(auction.id);
                auction.mainImage = mainImage;
                const highestBidder = await bidModel.getHighestBidder(auction.id);
                auction.highestBidder = highestBidder;
                const totalBid = await bidModel.countBib(auction.id);
                auction.totalBid = totalBid;
            })
        );

        return auctions;
    },


    async getAuctionBySellerId(seller_id) {
        const auctions = await auctionModel.findBySellerId(seller_id);
        if (!auctions) {
            return [];
        }

        await Promise.all(
            auctions.map(async function (auction) {
                const category = await categoryModel.findById(auction.category_id);
                auction.category = category;
                const seller = await userModel.findById(auction.seller_id);
                auction.seller = seller;
                const mainImage = await auctionImageModel.findMainByAuctionId(auction.id);
                auction.mainImage = mainImage;
                const highestBidder = await bidModel.getHighestBidder(auction.id);
                auction.highestBidder = highestBidder;
                const totalBid = await bidModel.countBib(auction.id);
                auction.totalBid = totalBid;
            })
        );

        return auctions;
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

        const auctions = await auctionModel.findAuctionsByCatIds(categoryIds, limit, offset);

        if (!auctions || auctions.length === 0) return [];

        await Promise.all(
            auctions.map(async (auction) => {
                auction.category = await categoryModel.findById(auction.category_id);
                auction.seller = await userModel.findById(auction.seller_id);
                auction.mainImage = await auctionImageModel.findMainByAuctionId(auction.id);
                auction.highestBidder = await bidModel.getHighestBidder(auction.id);
                auction.totalBid = await bidModel.countBib(auction.id);
            })
        );

        return auctions;
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
        const auctions = await auctionModel.findTop5EndingSoon();

        await Promise.all(
            auctions.map(async function (auction) {
                const category = await categoryModel.findById(auction.category_id);
                auction.category = category;
                const mainImage = await auctionImageModel.findMainByAuctionId(auction.id);
                auction.mainImage = mainImage;
            })
        );

        return auctions;
    },

    async getTop5MostBids() {
        const auctions = await auctionModel.findTop5MostBids();

        await Promise.all(
            auctions.map(async function (auction) {
                const category = await categoryModel.findById(auction.category_id);
                auction.category = category;
                const mainImage = await auctionImageModel.findMainByAuctionId(auction.id);
                auction.mainImage = mainImage;
            })
        );

        return auctions;
    },

    async getTop5HighestPrice() {
        const auctions = await auctionModel.findTop5HighestPrice();

        await Promise.all(
            auctions.map(async function (auction) {
                const category = await categoryModel.findById(auction.category_id);
                auction.category = category;
                const mainImage = await auctionImageModel.findMainByAuctionId(auction.id);
                auction.mainImage = mainImage;
            })
        );

        return auctions;
    },


    async countAuctionByQuery(q) {
        const tsquery = q.trim().split(/\s+/).join("|");
        const { count } = await auctionModel.countAuctionsByQuery(tsquery);
        return +count;
    },

    async getAuctionByQuery(q, limit, offset, sort) {
        const tsquery = q.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .trim().split(/\s+/).join("|");
        let sortQuery = ["end_at", "decs"];
        if (sort) {
            sortQuery = sort.trim().split(/-+/);
        }


        const auctions = await auctionModel.findAuctionsByQuery(tsquery, limit, offset, sortQuery);

        await Promise.all(
            auctions.map(async (auction) => {
                auction.category = await categoryModel.findById(auction.category_id);
                auction.seller = await userModel.findById(auction.seller_id);
                auction.mainImage = await auctionImageModel.findMainByAuctionId(auction.id);
                auction.highestBidder = await bidModel.getHighestBidder(auction.id);
                auction.totalBid = await bidModel.countBib(auction.id);
            })
        );

        return auctions;
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
        const auctions = await auctionModel.findAuctionsWon(user_id);
        if (!auctions) {
            return [];
        }

        await Promise.all(
            auctions.map(async function (auction) {
                const category = await categoryModel.findById(auction.category_id);
                auction.category = category;
                const seller = await userModel.findById(auction.seller_id);
                auction.seller = seller;
                const mainImage = await auctionImageModel.findMainByAuctionId(auction.id);
                auction.mainImage = mainImage;
                const highestBidder = await bidModel.getHighestBidder(auction.id);
                auction.highestBidder = highestBidder;
            })
        );

        return auctions;
    },

    async handleBlockBidder(auctionBlock) {
        await auctionBlockModel.createOne(auctionBlock);

        await bidModel.deleteBib(auctionBlock.user_id, auctionBlock.auction_id);

        const highestBidder = await bidModel.getHighestBidder(auctionBlock.auction_id);
        const auction = await auctionModel.getAuctionById(auctionBlock.auction_id);

        auction.current_price = highestBidder
            ? highestBidder.amount
            : auction.start_price;
        auctionModel.update(auction);
    }
};

export default auctionService;