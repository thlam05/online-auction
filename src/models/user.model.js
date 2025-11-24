import db from "../configs/db.config.js"

const User = {
    findAll() {
        return db("users");
    },

    findById(id) {
        return db("users").where({ id: id });
    },

    findByEmail(email) {
        return db("users").where({ email: email }).first();
    },

    createOne(user) {
        return db("users").insert(user).returning("*");
    },

    updateOne(id, user) {
        return db("users").where({ id: id }).update(user);
    }

};

export default User;