

class AuctionController {

    // GET - /auctions
    showAllAuctions(req, res, next) {
        res.render("auctionsByCategory");
    }
}

export default new AuctionController();