

class BidController {
    async createBib(req, res, next) {
        try {
            res.json({ message: "test" });
        } catch (err) {
            next(err);
        }
    }
}

export default new BidController();