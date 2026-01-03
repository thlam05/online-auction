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

    async getCategoriesHierarchical({ page = 1, limit = 10, search = '' }) {
        const allCategories = await categoryModel.findAll();

        const categoryMap = {};
        allCategories.forEach(cat => {
            categoryMap[cat.id] = { ...cat, children: [] };
        });

        const rootCategories = [];
        allCategories.forEach(cat => {
            if (cat.parent_category_id === null) {
                rootCategories.push(categoryMap[cat.id]);
            } else if (categoryMap[cat.parent_category_id]) {
                categoryMap[cat.parent_category_id].children.push(categoryMap[cat.id]);
            }
        });

        const flattenHierarchy = (categories, level = 0) => {
            let result = [];
            categories.forEach(cat => {
                result.push({ ...cat, level });
                if (cat.children && cat.children.length > 0) {
                    result = result.concat(flattenHierarchy(cat.children, level + 1));
                }
            });
            return result;
        };

        let flatCategories = flattenHierarchy(rootCategories);

        if (search) {
            flatCategories = flatCategories.filter(cat =>
                cat.name.toLowerCase().includes(search.toLowerCase()) ||
                cat.slug.toLowerCase().includes(search.toLowerCase())
            );
        }

        const total = flatCategories.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedCategories = flatCategories.slice(offset, offset + limit);

        return {
            categories: paginatedCategories,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    },

    async createCategory(data) {
        const slug = data.name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        return categoryModel.create({ ...data, slug });
    },

    async deleteCategory(id) {
        const hasChildren = await categoryModel.hasChildren(id);
        if (hasChildren) {
            throw new Error('Không thể xóa danh mục có danh mục con');
        }

        const hasProducts = await categoryModel.hasProducts(id);
        if (hasProducts) {
            throw new Error('Không thể xóa danh mục đã có sản phẩm');
        }

        return categoryModel.deleteById(id);
    },
};


export default categoryService;