import categoryModel from "../models/category.model.js";

const categoryService = {
    async getAllCategory() {
        const categories = await categoryModel.findCategoriesLevel1();
        await Promise.all(
            categories.map(async function (category) {
                const subCategories = await categoryModel.findCategoiesLevel2(category.id);
                category.subCategories = subCategories;
            })
        );
        return categories;
    },
};


export default categoryService;