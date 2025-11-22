import { create } from "express-handlebars";
import db from "../configs/db.config.js"

const PendingUser = {
    findByEmail(email) {
        return db("pending_users").where({ email: email }).first();
    },

    findById(id) {
        return db("pending_users").where({ id: id }).first();
    },

    createOne(pendingUserData) {
        return db("pending_users").insert(pendingUserData).returning("*");
    },

    updateOne(id, updateData) {
        return db("pending_users").where({ id: id }).update(updateData);
    },

    deleteOne(id) {
        return db("pending_users").where({ id: id }).del();
    }
};

export default PendingUser;