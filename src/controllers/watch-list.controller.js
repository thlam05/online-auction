import watchListModel from "../models/watch-list.model.js";

class WatchListController {
    // POST - /watch-list/del/:id
    async deleteWatchlistItem(req, res, next) {
        try {
            const { id } = req.params;
            const result = await watchListModel.deleteWatchList(id);
            res.redirect("/user/watch-list");
        } catch (err) {
            next(err);
        }
    }

    // POST - /watch-list/add
    async addWatchListItem(req, res, next) {
        try {
            const { auction_id } = req.body;
            const user_id = req.session.passport.user.id;
            const watch_list = {
                auction_id: auction_id,
                user_id: user_id,
                created_at: new Date()
            }
            const newWatchList = await watchListModel.addWatchListItem(watch_list);
            return res.json(newWatchList);
        } catch (err) {
            next(err);
        }
    }
}

export default new WatchListController();