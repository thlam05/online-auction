import { create } from "express-handlebars";
import db from "../configs/db.config.js"

const pendingUserModel = {
    findByEmail(email) {
        return db("pending_users").where({ email: email }).first();
    },

    findById(id) {
        return db("pending_users").where({ id: id }).first();
    },

    findByUserId(id) {
        return db("pending_users").where({ user_id: id }).first();
    },

    createOne(pendingUserData) {
        return db("pending_users").insert(pendingUserData).returning("*");
    },

    updateOne(id, updateData) {
        return db("pending_users").where({ id: id }).update(updateData).returning("*");
    },

    deleteOne(id) {
        return db("pending_users").where({ id: id }).del();
    },

    deleteByEmail(email) {
        return db("pending_users").where({ email: email }).del();
    },

    deleteByUserId(user_id) {
        return db("pending_users").where({ user_id: user_id }).del();
    }
};

export default pendingUserModel;