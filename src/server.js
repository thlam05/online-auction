import express from "express";
import route from "./routes/index.route.js";
import config from "./configs/config.js";
import configSession from "./configs/session.config.js";
import configEngine from "./configs/engine.config.js";
import passport from "passport";
import cookieParser from "cookie-parser";
import { authenticate } from "./middlewares/authenticate.js";
import { errorHandler, errorNotFoundHandler } from "./middlewares/error-handler.js";
import db from "./configs/db.config.js";

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

app.use(errorHandler);
app.use(errorNotFoundHandler);

const server = app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
});

const shutdown = async (signal) => {
    console.log(`\n${signal} signal received: closing HTTP server`);
    server.close(async () => {
        console.log('HTTP server closed');
        try {
            await db.destroy();
            console.log('Database connections closed');
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGUSR2', () => shutdown('SIGUSR2'));