import db from "../configs/db.config.js"

const categoryModel = {
    findAll() {
        return db("categories");
    },

    findById(id) {
        return db("categories").where({ id: id }).first();
    },

    findBySlug(slug) {
        return db("categories").where({ slug: slug }).first();
    },

    findCategoriesLevel1() {
        return db("categories").where({ parent_category_id: null });
    },

    findCategoiesLevel2(parent_id) {
        return db("categories").where({ parent_category_id: parent_id });
    },

    findAllWithSubCategories() {
        return db("categories as c1")
            .leftJoin("categories as c2", "c2.parent_category_id", "c1.id")
            .where("c1.parent_category_id", null)
            .select(
                "c1.*",
                db.raw("json_agg(json_build_object('id', c2.id, 'name', c2.name, 'slug', c2.slug, 'parent_category_id', c2.parent_category_id) ORDER BY c2.id) FILTER (WHERE c2.id IS NOT NULL) as sub_categories")
            )
            .groupBy("c1.id");
    },

    create(data) {
        return db("categories").insert(data).returning("*");
    },

    deleteById(id) {
        return db("categories").where({ id }).del();
    },

    update(id, data) {
        return db("categories").where({ id }).update(data).returning("*");
    },

    async hasChildren(id) {
        const count = await db("categories")
            .where({ parent_category_id: id })
            .count("* as count")
            .first();
        return parseInt(count.count) > 0;
    },

    async hasProducts(id) {
        const count = await db("auctions")
            .where({ category_id: id })
            .count("* as count")
            .first();
        return parseInt(count.count) > 0;
    },

    async findWithParent(id) {
        return db("categories as c")
            .leftJoin("categories as p", "c.parent_category_id", "p.id")
            .where("c.id", id)
            .select(
                "c.*",
                db.raw("json_build_object('id', p.id, 'name', p.name) as parent_category")
            )
            .first();
    },

    // Full-text search for categories
    async searchCategories(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return this.findAll();
        }

        // Normalize Vietnamese text: remove diacritics
        const normalizedSearch = searchTerm
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .trim();

        // Use ILIKE for case-insensitive search with pattern matching
        // This works well for Vietnamese without needing full FTS extension
        return db("categories")
            .where(function () {
                this.where('name', 'ilike', `%${normalizedSearch}%`)
                    .orWhere('slug', 'ilike', `%${normalizedSearch}%`)
                    .orWhereRaw(
                        `unaccent(lower(name)) ILIKE unaccent(lower(?))`,
                        [`%${searchTerm}%`]
                    );
            });
    }
}

export default categoryModel;