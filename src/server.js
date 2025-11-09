import express from "express";
import route from "./routes/index.route.js";
import { engine } from "express-handlebars";
import expressHandlebarsSections from "express-handlebars-sections";

const app = express();
const port = process.env.port || 3000;

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

import dp from "../src/utils/db.js"

app.get("/", async (req, res) => {
    const roles = await dp("roles");
    res.json(roles);
});

route(app);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});