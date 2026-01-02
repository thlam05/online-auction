import db from "../configs/db.config.js";

const auctionModel = {
    findAll() {
        return db("auctions");
    },

    findById(id) {
        return db("auctions").where({ id: id }).first();
    },

    findBySellerId(seller_id) {
        return db("auctions").where({ seller_id: seller_id });
    },

    findAuctionsWon(user_id) {
        return db("auctions as a")
            .join("bids as b", "a.id", "b.auction_id")
            .where("a.end_at", "<=", new Date())
            .where("b.bidder_id", user_id)
            .where("b.amount", "=", function () {
                this.select(db.raw("MAX(b2.amount)"))
                    .from("bids as b2")
                    .whereRaw("b2.auction_id = a.id");
            })
            .select("a.*");
    },

    findTop5EndingSoon() {
        return db("auctions").where("end_at", ">", new Date()).orderBy("end_at", "asc").limit(5);
    },

    findTop5MostBids() {
        return db("auctions as a")
            .leftJoin("bids as b", "b.auction_id", "a.id")
            .select("a.*")
            .count("b.id as total_bids")
            .groupBy("a.id")
            .orderBy("total_bids", "desc")
            .limit(5);
    },

    findTop5HighestPrice() {
        return db("auctions")
            .orderBy("current_price", "desc")
            .limit(5);
    },

    findAuctions(limit, offset) {
        return db("auctions").limit(limit).offset(offset);
    },

    findAuctionsByCat(cat_id, limit, offset) {
        return db("auctions").where("category_id", cat_id).limit(limit).offset(offset);
    },

    findAuctionsByCatIds(listCatId, limit, offset) {
        return db("auctions").whereIn("category_id", listCatId).limit(limit).offset(offset);
    },

    findRelateAuctions(category_id) {
        return db("auctions as a")
            .leftJoin("auction_images as ai", function () {
                this.on("ai.auction_id", "=", "a.id")
                    .andOn("ai.is_main", "=", db.raw("true"));
            })
            .where("a.category_id", category_id)
            .select(
                "a.*",
                "ai.url as auction_img"
            )
            .orderBy("a.created_at", "desc")
            .limit(5);
    },

    countAllAuctions() {
        return db("auctions").count("id as count").first();
    },

    countAllAuctionsByCat(cat_id) {
        return db("auctions").count("id as count").where("category_id", cat_id).first();
    },

    countAuctionsByQuery(tsquery) {
        return db("auctions").count("id as count").whereRaw(`fts @@ to_tsquery('${tsquery}')`).first();
    },

    findAuctionsByQuery(tsquery, limit, offset, sortQuery) {
        return db("auctions").whereRaw(`fts @@ to_tsquery('${tsquery}')`).orderBy(...sortQuery).limit(limit).offset(offset);
    },

    createOne(auction) {
        return db("auctions").insert(auction).returning("*");
    },

    update(auction) {
        const { id, fts, ...auction_data } = auction;
        return db('auctions')
            .where({ id: id })
            .update(auction_data)
            .returning("*");
    },

    searchAuctionsByName(query, limit) {
        return db("auctions")
            .where("name", "ilike", `%${query}%`)
            .orderBy("created_at", "desc")
            .limit(limit);
    },

    // Thay vì 1 sản phẩm query N + 1 lần thì gộp thành 1 lần query (đoạn này thì vibe code có nhờ AI giúp)

    findAllWithRelations() {
        return db("auctions as a")
            .leftJoin("categories as c", "c.id", "a.category_id")
            .leftJoin("users as u", "u.id", "a.seller_id")
            .leftJoin("auction_images as ai", function () {
                this.on("ai.auction_id", "a.id").andOn("ai.is_main", db.raw("true"));
            })
            .select(
                "a.*",
                db.raw("json_build_object('id', c.id, 'name', c.name, 'parent_category_id', c.parent_category_id) as category"),
                db.raw("json_build_object('id', u.id, 'username', u.username, 'email', u.email) as seller"),
                db.raw("json_build_object('url', ai.url, 'is_main', ai.is_main) as \"mainImage\"")
            );
    },

    findAuctionsWithRelations(limit, offset) {
        return db("auctions as a")
            .leftJoin("categories as c", "c.id", "a.category_id")
            .leftJoin("users as u", "u.id", "a.seller_id")
            .leftJoin("auction_images as ai", function () {
                this.on("ai.auction_id", "a.id").andOn("ai.is_main", db.raw("true"));
            })
            .leftJoin(
                db("bids")
                    .select("auction_id", db.raw("MAX(amount) as max_amount"))
                    .groupBy("auction_id")
                    .as("max_bids"),
                "max_bids.auction_id",
                "a.id"
            )
            .leftJoin("bids as highest_bid", function () {
                this.on("highest_bid.auction_id", "a.id")
                    .andOn("highest_bid.amount", "max_bids.max_amount");
            })
            .leftJoin("users as bidder", "bidder.id", "highest_bid.bidder_id")
            .select(
                "a.*",
                db.raw("json_build_object('id', c.id, 'name', c.name, 'parent_category_id', c.parent_category_id) as category"),
                db.raw("json_build_object('id', u.id, 'username', u.username, 'email', u.email) as seller"),
                db.raw("json_build_object('url', ai.url, 'is_main', ai.is_main) as \"mainImage\""),
                db.raw("json_build_object('id', bidder.id, 'username', bidder.username, 'email', bidder.email) as \"highestBidder\"")
            )
            .limit(limit)
            .offset(offset);
    },

    findAuctionsByCatWithRelations(cat_id, limit, offset) {
        return db("auctions as a")
            .leftJoin("categories as c", "c.id", "a.category_id")
            .leftJoin("users as u", "u.id", "a.seller_id")
            .leftJoin("auction_images as ai", function () {
                this.on("ai.auction_id", "a.id").andOn("ai.is_main", db.raw("true"));
            })
            .leftJoin(
                db("bids")
                    .select("auction_id", db.raw("MAX(amount) as max_amount"))
                    .groupBy("auction_id")
                    .as("max_bids"),
                "max_bids.auction_id",
                "a.id"
            )
            .leftJoin("bids as highest_bid", function () {
                this.on("highest_bid.auction_id", "a.id")
                    .andOn("highest_bid.amount", "max_bids.max_amount");
            })
            .leftJoin("users as bidder", "bidder.id", "highest_bid.bidder_id")
            .where("a.category_id", cat_id)
            .select(
                "a.*",
                db.raw("json_build_object('id', c.id, 'name', c.name, 'parent_category_id', c.parent_category_id) as category"),
                db.raw("json_build_object('id', u.id, 'username', u.username, 'email', u.email) as seller"),
                db.raw("json_build_object('url', ai.url, 'is_main', ai.is_main) as \"mainImage\""),
                db.raw("json_build_object('id', bidder.id, 'username', bidder.username, 'email', bidder.email) as \"highestBidder\"")
            )
            .limit(limit)
            .offset(offset);
    },

    findAuctionsByCatIdsWithRelations(listCatId, limit, offset) {
        return db("auctions as a")
            .leftJoin("categories as c", "c.id", "a.category_id")
            .leftJoin("users as u", "u.id", "a.seller_id")
            .leftJoin("auction_images as ai", function () {
                this.on("ai.auction_id", "a.id").andOn("ai.is_main", db.raw("true"));
            })
            .leftJoin(
                db("bids")
                    .select("auction_id", db.raw("MAX(amount) as max_amount"))
                    .groupBy("auction_id")
                    .as("max_bids"),
                "max_bids.auction_id",
                "a.id"
            )
            .leftJoin("bids as highest_bid", function () {
                this.on("highest_bid.auction_id", "a.id")
                    .andOn("highest_bid.amount", "max_bids.max_amount");
            })
            .leftJoin("users as bidder", "bidder.id", "highest_bid.bidder_id")
            .whereIn("a.category_id", listCatId)
            .select(
                "a.*",
                db.raw("json_build_object('id', c.id, 'name', c.name, 'parent_category_id', c.parent_category_id) as category"),
                db.raw("json_build_object('id', u.id, 'username', u.username, 'email', u.email) as seller"),
                db.raw("json_build_object('url', ai.url, 'is_main', ai.is_main) as \"mainImage\""),
                db.raw("json_build_object('id', bidder.id, 'username', bidder.username, 'email', bidder.email) as \"highestBidder\"")
            )
            .limit(limit)
            .offset(offset);
    },

    findBySellerIdWithRelations(seller_id) {
        return db("auctions as a")
            .leftJoin("categories as c", "c.id", "a.category_id")
            .leftJoin("users as u", "u.id", "a.seller_id")
            .leftJoin("auction_images as ai", function () {
                this.on("ai.auction_id", "a.id").andOn("ai.is_main", db.raw("true"));
            })
            .leftJoin(
                db("bids")
                    .select("auction_id", db.raw("MAX(amount) as max_amount"))
                    .groupBy("auction_id")
                    .as("max_bids"),
                "max_bids.auction_id",
                "a.id"
            )
            .leftJoin("bids as highest_bid", function () {
                this.on("highest_bid.auction_id", "a.id")
                    .andOn("highest_bid.amount", "max_bids.max_amount");
            })
            .leftJoin("users as bidder", "bidder.id", "highest_bid.bidder_id")
            .where("a.seller_id", seller_id)
            .select(
                "a.*",
                db.raw("json_build_object('id', c.id, 'name', c.name, 'parent_category_id', c.parent_category_id) as category"),
                db.raw("json_build_object('id', u.id, 'username', u.username, 'email', u.email) as seller"),
                db.raw("json_build_object('url', ai.url, 'is_main', ai.is_main) as \"mainImage\""),
                db.raw("json_build_object('id', bidder.id, 'username', bidder.username, 'email', bidder.email) as \"highestBidder\"")
            );
    },

    findTop5EndingSoonWithRelations() {
        return db("auctions as a")
            .leftJoin("categories as c", "c.id", "a.category_id")
            .leftJoin("auction_images as ai", function () {
                this.on("ai.auction_id", "a.id").andOn("ai.is_main", db.raw("true"));
            })
            .where("a.end_at", ">", new Date())
            .select(
                "a.*",
                db.raw("json_build_object('id', c.id, 'name', c.name, 'parent_category_id', c.parent_category_id) as category"),
                db.raw("json_build_object('url', ai.url, 'is_main', ai.is_main) as \"mainImage\"")
            )
            .orderBy("a.end_at", "asc")
            .limit(5);
    },

    findTop5MostBidsWithRelations() {
        return db("auctions as a")
            .leftJoin("bids as b", "b.auction_id", "a.id")
            .leftJoin("categories as c", "c.id", "a.category_id")
            .leftJoin("auction_images as ai", function () {
                this.on("ai.auction_id", "a.id").andOn("ai.is_main", db.raw("true"));
            })
            .select(
                "a.*",
                db.raw("json_build_object('id', c.id, 'name', c.name, 'parent_category_id', c.parent_category_id) as category"),
                db.raw("json_build_object('url', ai.url, 'is_main', ai.is_main) as \"mainImage\""),
                db.raw("COUNT(b.id) as total_bids")
            )
            .groupBy("a.id", "c.id", "ai.url", "ai.is_main")
            .orderBy("total_bids", "desc")
            .limit(5);
    },

    findTop5HighestPriceWithRelations() {
        return db("auctions as a")
            .leftJoin("categories as c", "c.id", "a.category_id")
            .leftJoin("auction_images as ai", function () {
                this.on("ai.auction_id", "a.id").andOn("ai.is_main", db.raw("true"));
            })
            .select(
                "a.*",
                db.raw("json_build_object('id', c.id, 'name', c.name, 'parent_category_id', c.parent_category_id) as category"),
                db.raw("json_build_object('url', ai.url, 'is_main', ai.is_main) as \"mainImage\"")
            )
            .orderBy("a.current_price", "desc")
            .limit(5);
    },

    findAuctionsByQueryWithRelations(tsquery, limit, offset, sortQuery) {
        return db("auctions as a")
            .leftJoin("categories as c", "c.id", "a.category_id")
            .leftJoin("users as u", "u.id", "a.seller_id")
            .leftJoin("auction_images as ai", function () {
                this.on("ai.auction_id", "a.id").andOn("ai.is_main", db.raw("true"));
            })
            .whereRaw(`a.fts @@ to_tsquery('${tsquery}')`)
            .select(
                "a.*",
                db.raw("json_build_object('id', c.id, 'name', c.name, 'parent_category_id', c.parent_category_id) as category"),
                db.raw("json_build_object('id', u.id, 'username', u.username, 'email', u.email) as seller"),
                db.raw("json_build_object('url', ai.url, 'is_main', ai.is_main) as \"mainImage\"")
            )
            .orderBy(...sortQuery)
            .limit(limit)
            .offset(offset);
    },

    findAuctionsWonWithRelations(user_id) {
        return db("auctions as a")
            .join("bids as b", "a.id", "b.auction_id")
            .leftJoin("categories as c", "c.id", "a.category_id")
            .leftJoin("users as u", "u.id", "a.seller_id")
            .leftJoin("auction_images as ai", function () {
                this.on("ai.auction_id", "a.id").andOn("ai.is_main", db.raw("true"));
            })
            .leftJoin(
                db("bids")
                    .select("auction_id", db.raw("MAX(amount) as max_amount"))
                    .groupBy("auction_id")
                    .as("max_bids"),
                "max_bids.auction_id",
                "a.id"
            )
            .leftJoin("bids as highest_bid", function () {
                this.on("highest_bid.auction_id", "a.id")
                    .andOn("highest_bid.amount", "max_bids.max_amount");
            })
            .leftJoin("users as bidder", "bidder.id", "highest_bid.bidder_id")
            .where("a.end_at", "<=", new Date())
            .where("b.bidder_id", user_id)
            .where("b.amount", "=", function () {
                this.select(db.raw("MAX(b2.amount)"))
                    .from("bids as b2")
                    .whereRaw("b2.auction_id = a.id");
            })
            .select(
                "a.*",
                db.raw("json_build_object('id', c.id, 'name', c.name, 'parent_category_id', c.parent_category_id) as category"),
                db.raw("json_build_object('id', u.id, 'username', u.username, 'email', u.email) as seller"),
                db.raw("json_build_object('url', ai.url, 'is_main', ai.is_main) as \"mainImage\""),
                db.raw("json_build_object('id', bidder.id, 'username', bidder.username, 'email', bidder.email) as \"highestBidder\"")
            );
    }
};

export default auctionModel;