import { engine } from "express-handlebars";
import expressHandlebarsSections from "express-handlebars-sections";

function configEngine(app) {
    app.engine("handlebars", engine({
        defaultLayout: "main",
        layoutsDir: "src/resources/views/layouts",
        partialsDir: "src/resources/views/partials",
        helpers: {
            section: expressHandlebarsSections()
        }
    }));
    app.set("view engine", "handlebars");
    app.set("views", "src/resources/views");
}

export default configEngine;