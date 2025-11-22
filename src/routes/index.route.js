import AuthRouter from "./auth.route.js";
import HomeRouter from "./home.route.js";
import AuctionRouter from "./auction.route.js";
import UserRouter from "./user.route.js";

function route(app) {
    app.use("/", HomeRouter);
    app.use("/home", HomeRouter);
    app.use("/auth", AuthRouter);
    app.use("/auctions", AuctionRouter);
    app.use("/user", UserRouter);
}

export default route