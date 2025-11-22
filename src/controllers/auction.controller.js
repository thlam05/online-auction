

class AuctionController {

    // GET - /auctions
    getAllAuctions(req, res, next) {
        res.render("auctions/all-auctions");
    }

    // GET - /auctions/category
    getAuctionsByCategory(req, res, next) {
        res.render("auctions/auctions-by-category");
    }

    // GET - /auction/:id
    getAuctionsById(req, res, next) {
        res.render("auctions/auction-by-id");
    }
}

export default new AuctionController();