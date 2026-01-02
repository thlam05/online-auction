import AuthRouter from "./auth.route.js";
import HomeRouter from "./home.route.js";
import AuctionRouter from "./auction.route.js";
import UserRouter from "./user.route.js";
import BidRouter from "./bid.route.js";
import WatchListRouter from "./watch-list.route.js";
import AdminRouter from "./admin.route.js";
import { ensureAuthenticated, isAdmin } from "../middlewares/authenticate.js";

function route(app) {
    app.use("/", HomeRouter);
    app.use("/home", HomeRouter);
    app.use("/auth", AuthRouter);
    app.use("/auctions", AuctionRouter);
    app.use("/user", ensureAuthenticated, UserRouter);
    app.use("/bids", BidRouter);
    app.use("/watch-list", ensureAuthenticated, WatchListRouter);
    app.use("/admin", ensureAuthenticated, isAdmin, AdminRouter);
}

export default route