import session from "express-session";
import { ConnectSessionKnexStore } from "connect-session-knex";
import db from "./db.config.js";
import config from "./config.js";

function configSession(app) {
    app.use(session({
        store: new ConnectSessionKnexStore({
            knex: db,
            tablename: "sessions"
        }),
        secret: config.sessionSecretKey,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 }
    }));
}

export default configSession;
