import dotenv from "dotenv/config";

const config = {
    port: Number(process.env.PORT) || 3000,
    sessionSecretKey: process.env.SESSION_SECRET_KEY,

    databaseHost: process.env.DATABASE_HOST || "",
    databasePort: Number(process.env.DATABASE_PORT) || 5432,
    databaseUser: process.env.DATABASE_USER || "",
    databasePassword: process.env.DATABASE_PASSWORD || "",

    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",

}

export default config;