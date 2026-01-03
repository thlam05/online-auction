import dotenv from "dotenv/config";

const config = {
    port: Number(process.env.PORT) || 3000,
    sessionSecretKey: process.env.SESSION_SECRET_KEY,

    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,

    databaseHost: process.env.DATABASE_HOST || "",
    databasePort: Number(process.env.DATABASE_PORT) || 5432,
    databaseUser: process.env.DATABASE_USER || "",
    databasePassword: process.env.DATABASE_PASSWORD || "",
    databaseName: process.env.DATABASE_NAME || "",

    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",

    facebookAppId: process.env.FACEBOOK_APP_ID || "",
    facebookAppSecret: process.env.FACEBOOK_APP_SECRET || "",

    googleAppEmail: process.env.GOOGLE_APP_EMAIL || "",
    googleAppPassword: process.env.GOOGLE_APP_PASSWORD || "",


}

export default config;