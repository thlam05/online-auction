import AuthRouter from "./auth.route.js";
import HomeRouter from "./home.route.js";

function route(app) {
    app.use("/", HomeRouter);
    app.use("/home", HomeRouter);
    app.use("/auth", AuthRouter);
}

export default route