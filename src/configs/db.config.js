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
    pool: { min: 0, max: 7 }
});

export default db;
