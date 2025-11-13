import express from "express";
import route from "./routes/index.route.js";
import { engine } from "express-handlebars";
import expressHandlebarsSections from "express-handlebars-sections";
import config from "./configs/config.js";
import configSession from "./configs/session.config.js";

const app = express();
const port = config.port;

app.use(express.urlencoded());
app.use(express.json());
app.use(express.static("src/public"));

app.engine("handlebars", engine({
    helpers: {
        section: expressHandlebarsSections()
    }
}));
app.set("view engine", "handlebars");
app.set("views", "src/resources/views");

// configSession(app);

route(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});