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
    }
};

export default auctionModel;