import session from "express-session";
import { ConnectSessionKnexStore } from "connect-session-knex";
import db from "./db.config.js";
import config from "./config.js";
import passport from "passport";

function configSession(app) {
    app.use(session({
        store: new ConnectSessionKnexStore({
            knex: db,
            tablename: "sessions"
        }),
        secret: config.sessionSecretKey,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 }
    }));

    app.use(passport.authenticate('session'));
}

export default configSession;
