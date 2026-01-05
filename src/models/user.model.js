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
    },

    async findUsersForAdmin({ page = 1, limit = 10, search = '', role = '', status = '' }) {
        const offset = (page - 1) * limit;

        let query = db("users as u")
            .leftJoin("pending_users as pu", "pu.user_id", "u.id");

        let countQuery = db("users as u")
            .leftJoin("pending_users as pu", "pu.user_id", "u.id");

        if (search) {
            const searchTerm = `%${search.trim()}%`;
            query = query.where(function () {
                this.whereRaw(
                    `unaccent(lower(u.username)) ILIKE unaccent(lower(?))`,
                    [searchTerm]
                )
                    .orWhereRaw(
                        `unaccent(lower(u.email)) ILIKE unaccent(lower(?))`,
                        [searchTerm]
                    );
            });
            countQuery = countQuery.where(function () {
                this.whereRaw(
                    `unaccent(lower(u.username)) ILIKE unaccent(lower(?))`,
                    [searchTerm]
                )
                    .orWhereRaw(
                        `unaccent(lower(u.email)) ILIKE unaccent(lower(?))`,
                        [searchTerm]
                    );
            });
        }

        if (role !== '') {
            query = query.where("u.permission", role);
            countQuery = countQuery.where("u.permission", role);
        }

        if (status === 'pending') {
            query = query.whereNotNull("pu.id");
            countQuery = countQuery.whereNotNull("pu.id");
        } else if (status === 'approved') {
            query = query.where("u.permission", 1);
            countQuery = countQuery.where("u.permission", 1);
        }

        const [{ count }] = await countQuery.count("u.id as count");
        const total = parseInt(count);

        const users = await query
            .select(
                "u.*",
                "pu.id as pending_id",
                db.raw("CASE WHEN pu.id IS NOT NULL THEN 'pending' WHEN u.permission = 1 THEN 'approved' ELSE NULL END as upgrade_status")
            )
            .orderBy("u.created_at", "desc")
            .limit(limit)
            .offset(offset);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    deleteOne(id) {
        return db("users").where({ id: id }).del();
    }

};

export default userModel;