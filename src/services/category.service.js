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

    async updateCategory(id, data) {
        const category = await categoryModel.findById(id);
        if (!category) {
            throw new Error('Không tìm thấy danh mục');
        }

        if (data.parent_category_id && data.parent_category_id == id) {
            throw new Error('Danh mục không thể là danh mục cha của chính nó');
        }

        if (data.parent_category_id !== undefined && data.parent_category_id !== null && data.parent_category_id !== '') {
            const newParent = await categoryModel.findById(data.parent_category_id);

            if (newParent.parent_category_id === category.parent_category_id) {
                throw new Error('Không thể chọn danh mục cùng cấp làm danh mục cha');
            }
        }

        const updateData = {};

        if (data.name && data.name !== category.name) {
            updateData.name = data.name;
            updateData.slug = data.name.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        if (data.parent_category_id !== undefined) {
            updateData.parent_category_id = data.parent_category_id || null;
        }

        if (Object.keys(updateData).length === 0) {
            return category;
        }

        return categoryModel.update(id, updateData);
    },
};


export default categoryService;