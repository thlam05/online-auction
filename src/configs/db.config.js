import knex from "knex";

const db = knex({
    client: "pg",
    connection: {
        host: "aws-1-ap-southeast-2.pooler.supabase.com",
        port: 5432,
        user: "postgres.jusvudcbvawagngobnsm",
        password: "c1NZUAEy0C8t0v4Y",
        database: "postgres"
    },
    pool: { min: 0, max: 7 }
});

export default db;
