import session from "express-session";
import { ConnectSessionKnexStore } from "connect-session-knex";
import db from "./db.config.js";
import config from "./config.js";
import passport from "passport";

const TIME_15_MINUTES = 1000 * 60 * 15;
const TIME_30_MINUTES = 1000 * 60 * 30;
const TIME_1_HOUR = 1000 * 60 * 60;
const TIME_12_HOURS = 1000 * 60 * 60 * 12;
const TIME_24_HOURS = 1000 * 60 * 60 * 24;

const configSession = (app) => {
    app.use(session({
        store: new ConnectSessionKnexStore({
            knex: db,
            tablename: "sessions",
            createtable: false,
            clearInterval: 60000
        }),
        secret: config.sessionSecretKey,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: TIME_24_HOURS }
    }));

    app.use(passport.authenticate('session'));
}

export default configSession;
