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
                db.raw("json_build_object('url', ai.url) as \"mainImage\"")
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
    countAllAuctionsByCatWithSubcategories(parent_cat_id) {
        return db("auctions as a")
            .join("categories as c", "a.category_id", "c.id")
            .where(function () {
                this.where("c.id", parent_cat_id)
                    .orWhere("c.parent_category_id", parent_cat_id);
            })
            .count("a.id as count")
            .first();
    },
    countAuctionsByQuery(tsquery) {
        return db("auctions")
            .count("id as count")
            .whereRaw("fts @@ to_tsquery(?)", [tsquery])
            .first();
    },
    findAuctionsByQuery(tsquery, limit, offset, sortQuery) {
        return db("auctions")
            .whereRaw("fts @@ to_tsquery(?)", [tsquery])
            .orderBy(...sortQuery)
            .limit(limit)
            .offset(offset);
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
            .whereRaw(
                `unaccent(lower(name)) ILIKE unaccent(lower(?))`,
                [`%${query.trim()}%`]
            )
            .orderBy("created_at", "desc")
            .limit(limit);
    },
    baseAuctionQuerySimple() {
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
    baseAuctionQueryFull() {
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
            );
    },
    findAllWithRelations() {
        return this.baseAuctionQuerySimple();
    },
    findAuctionsWithRelations(limit, offset) {
        return this.baseAuctionQueryFull()
            .limit(limit)
            .offset(offset);
    },
    findAuctionsByCatWithRelations(cat_id, limit, offset) {
        return this.baseAuctionQueryFull()
            .where("a.category_id", cat_id)
            .limit(limit)
            .offset(offset);
    },
    findAuctionsByCatIdsWithRelations(listCatId, limit, offset) {
        return this.baseAuctionQueryFull()
            .whereIn("a.category_id", listCatId)
            .limit(limit)
            .offset(offset);
    },
    findBySellerIdWithRelations(seller_id) {
        return this.baseAuctionQueryFull()
            .where("a.seller_id", seller_id);
    },
    findTop5EndingSoonWithRelations() {
        return this.baseAuctionQuerySimple()
            .where("a.end_at", ">", new Date())
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
        return this.baseAuctionQuerySimple()
            .orderBy("a.current_price", "desc")
            .limit(5);
    },
    findAuctionsByQueryWithRelations(tsquery, limit, offset, sortQuery) {
        return this.baseAuctionQuerySimple()
            .whereRaw("a.fts @@ to_tsquery(?)", [tsquery])
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
    },
    findByIdWithAllRelations(id) {
        return db("auctions as a")
            .leftJoin("users as u", "u.id", "a.seller_id")
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
            .where("a.id", id)
            .select(
                "a.*",
                db.raw("json_build_object('id', u.id, 'username', u.username, 'email', u.email, 'address', u.address, 'permission', u.permission, 'is_verified', u.is_verified) as seller"),
                db.raw("json_build_object('id', bidder.id, 'username', bidder.username, 'email', bidder.email) as \"highestBidder\""),
                db.raw("(SELECT json_agg(json_build_object('url', ai.url, 'is_main', ai.is_main, 'index', ai.index) ORDER BY ai.index) FROM auction_images ai WHERE ai.auction_id = a.id) as images")
            )
            .first();
    },
    async findAuctionsForAdmin({ page = 1, limit = 10, search = '', categoryId = '', status = '' }) {
        const offset = (page - 1) * limit;
        let query = db("auctions as a")
            .leftJoin("categories as c", "c.id", "a.category_id")
            .leftJoin("users as u", "u.id", "a.seller_id")
            .leftJoin("auction_images as ai", function () {
                this.on("ai.auction_id", "=", "a.id")
                    .andOn("ai.is_main", "=", db.raw("true"));
            });
        let countQuery = db("auctions as a")
            .leftJoin("categories as c", "c.id", "a.category_id")
            .leftJoin("users as u", "u.id", "a.seller_id");
        if (search) {
            const searchTerm = `%${search.trim()}%`;
            query = query.where(function () {
                this.whereRaw(
                    `unaccent(lower(a.name)) ILIKE unaccent(lower(?))`,
                    [searchTerm]
                )
                    .orWhereRaw(
                        `unaccent(lower(u.username)) ILIKE unaccent(lower(?))`,
                        [searchTerm]
                    );
            });
            countQuery = countQuery.where(function () {
                this.whereRaw(
                    `unaccent(lower(a.name)) ILIKE unaccent(lower(?))`,
                    [searchTerm]
                )
                    .orWhereRaw(
                        `unaccent(lower(u.username)) ILIKE unaccent(lower(?))`,
                        [searchTerm]
                    );
            });
        }
        if (categoryId) {
            query = query.where("a.category_id", categoryId);
            countQuery = countQuery.where("a.category_id", categoryId);
        }
        const now = new Date();
        if (status === 'active') {
            query = query.where("a.end_at", ">", now);
            countQuery = countQuery.where("a.end_at", ">", now);
        } else if (status === 'ended') {
            query = query.where("a.end_at", "<=", now);
            countQuery = countQuery.where("a.end_at", "<=", now);
        }
        const [{ count }] = await countQuery.count("a.id as count");
        const total = parseInt(count);
        const auctions = await query
            .select(
                "a.id",
                "a.name",
                "a.current_price",
                "a.end_at",
                "a.created_at",
                "ai.url as main_image",
                db.raw("json_build_object('id', c.id, 'name', c.name) as category"),
                db.raw("json_build_object('id', u.id, 'username', u.username) as seller"),
                db.raw("CASE WHEN a.end_at > NOW() THEN true ELSE false END as is_active")
            )
            .orderBy("a.created_at", "desc")
            .limit(limit)
            .offset(offset);
        return {
            auctions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },
    async deleteById(id) {
        await db("bids").where({ auction_id: id }).del();
        await db("watchlists").where({ auction_id: id }).del();
        await db("auction_images").where({ auction_id: id }).del();
        return db("auctions").where({ id }).del();
    }
};
export default auctionModel;
