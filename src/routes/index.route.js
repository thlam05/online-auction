import AuthRouter from "./auth.route.js";
import HomeRouter from "./home.route.js";
import auctionRouter from "./auction.route.js";

function route(app) {
    app.use("/", HomeRouter);
    app.use("/home", HomeRouter);
    app.use("/auth", AuthRouter);
    app.use("/auctions", auctionRouter);
}

export default route