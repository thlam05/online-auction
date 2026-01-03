import knex from "knex";
import config from "./config.js";

const db = knex({
    client: "pg",
    connection: {
        host: config.databaseHost,
        port: config.databasePort,
        user: config.databaseUser,
        password: config.databasePassword,
        database: config.databaseName
    },
    pool: {
        min: 2,
        max: 20,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000
    }
});

export default db;
