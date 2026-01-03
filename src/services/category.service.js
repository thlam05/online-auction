import categoryModel from "../models/category.model.js";

const categoryService = {
    async getAllCategory() {
        const categories = await categoryModel.findAllWithSubCategories();
        categories.forEach(category => {
            category.subCategories = category.sub_categories || [];
            delete category.sub_categories;
        });
        return categories;
    },
};


export default categoryService;