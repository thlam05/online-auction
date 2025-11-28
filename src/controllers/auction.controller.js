

class AuctionController {

    // GET - /auctions
    getAllAuctions(req, res, next) {
        try {
            res.render("auctions/all-auctions");
        } catch (err) {
            next(err);
        }
    }

    // GET - /auctions/category
    getAuctionsByCategory(req, res, next) {
        try {
            res.render("auctions/auctions-by-category");
        } catch (err) {
            next(err);
        }
    }

    // GET - /auction/:id
    getAuctionsById(req, res, next) {
        try {
            res.render("auctions/auction-by-id");
        } catch (err) {
            next(err);
        }
    }
}

export default new AuctionController();