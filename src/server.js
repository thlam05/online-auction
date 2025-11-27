import express from "express";
import route from "./routes/index.route.js";
import config from "./configs/config.js";
import configSession from "./configs/session.config.js";
import configEngine from "./configs/engine.config.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import { authenticate } from "./middlewares/authenticate.js";

const app = express();
const port = config.port;

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());
app.use(express.static("src/public"));
app.use(passport.initialize());


configEngine(app);

configSession(app);

app.use(authenticate);

route(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});