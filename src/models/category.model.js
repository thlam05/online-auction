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
    }
}

export default categoryModel;

