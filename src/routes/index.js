import AuthRouter from "./auth.js";
import HomeRouter from "./home.js";

function route(app) {
    app.use("/", HomeRouter);
    app.use("/home", HomeRouter);
    app.use("/auth", AuthRouter);
}

export default route