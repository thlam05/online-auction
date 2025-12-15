import db from "../configs/db.config.js";

const watchListModel = {
    async getWatchListByUserId(user_id) {
        const data = await db.raw(`
            SELECT
                a.*,
                s.id   AS seller_id,
                s.username AS seller_name,
                ai.url AS auction_img,
                w.id AS watch_list_id
            FROM watchlists AS w
            JOIN auctions AS a
                ON w.auction_id = a.id
            JOIN users AS s
                ON s.id = a.seller_id
            LEFT JOIN auction_images AS ai
                ON ai.auction_id = a.id
            AND ai.is_main = TRUE
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC;
            `, [user_id]);

        return data.rows
    },

    async deleteWatchList(id) {
        return db("watchlists").where("id", id).del();
    },

    async addWatchListItem(watch_list) {
        return db("watchlists").insert(watch_list).returning("*");
    }
}

export default watchListModel;