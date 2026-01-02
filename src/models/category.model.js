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
    }
}

export default categoryModel;

