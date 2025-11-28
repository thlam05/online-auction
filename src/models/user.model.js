import db from "../configs/db.config.js"

const userModel = {
    findAll() {
        return db("users");
    },

    findById(id) {
        return db("users").where({ id: id }).first();
    },

    findByEmail(email) {
        return db("users").where({ email: email }).first();
    },

    findByGoogleId(google_id) {
        return db("users").where({ google_id: google_id }).first();
    },

    findByFacebookId(facebook_id) {
        return db("users").where({ facebook_id: facebook_id }).first();
    },

    createOne(user) {
        return db("users").insert(user).returning("*");
    },

    updateOne(id, user) {
        return db("users").where({ id: id }).update(user).returning("*");
    }

};

export default userModel;