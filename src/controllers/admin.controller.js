import categoryService from '../services/category.service.js';
import categoryModel from '../models/category.model.js';

export const getDashboard = async (req, res) => {
    try {
        const allCategoriesForSelect = await categoryService.getAllCategory();
        const result = await categoryService.getCategoriesHierarchical({ page: 1, limit: 10 });

        const categoriesWithParent = await Promise.all(
            result.categories.map(async (cat) => {
                if (cat.parent_category_id) {
                    const parent = await categoryModel.findById(cat.parent_category_id);
                    return { ...cat, parent_category: parent };
                }
                return cat;
            })
        );

        res.render('admin/dashboard', {
            layout: 'admin-layout',
            title: 'Quản trị hệ thống',
            categories: categoriesWithParent,
            allCategories: allCategoriesForSelect,
            categoriesPages: result.pagination.totalPages,
            auctionsPages: 1,
            usersPages: 1
        });
    } catch (error) {
        console.error('Error in getDashboard:', error);
        res.status(500).render('error/500');
    }
};

export const getCategoriesData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const result = await categoryService.getCategoriesHierarchical({ page, limit, search });

        const categoriesWithParent = await Promise.all(
            result.categories.map(async (cat) => {
                if (cat.parent_category_id) {
                    const parent = await categoryModel.findById(cat.parent_category_id);
                    return { ...cat, parent_category: parent };
                }
                return cat;
            })
        );

        res.json({
            data: categoriesWithParent,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error in getCategoriesData:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, parent_category_id } = req.body;

        await categoryService.createCategory({
            name,
            parent_category_id: parent_category_id || null
        });

        res.redirect('/admin');
    } catch (error) {
        console.error('Error in createCategory:', error);
        res.status(500).render('error/500');
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        await categoryService.deleteCategory(id);

        res.json({ success: true });
    } catch (error) {
        console.error('Error in deleteCategory:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Không thể xóa danh mục'
        });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await categoryModel.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy danh mục'
            });
        }

        if (category.parent_category_id) {
            const parent = await categoryModel.findById(category.parent_category_id);
            category.parent_category = parent;
        }

        const allCategories = await categoryModel.findAll();
        const siblings = allCategories.filter(cat =>
            cat.parent_category_id === category.parent_category_id && cat.id !== category.id
        );
        category.sibling_ids = siblings.map(s => s.id);

        res.json({
            success: true,
            category
        });
    } catch (error) {
        console.error('Error in getCategoryById:', error);
        res.status(500).json({
            success: false,
            error: 'Đã xảy ra lỗi khi tải thông tin danh mục'
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parent_category_id } = req.body;

        const result = await categoryService.updateCategory(id, {
            name,
            parent_category_id
        });

        res.json({
            success: true,
            category: result[0] || result
        });
    } catch (error) {
        console.error('Error in updateCategory:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Không thể cập nhật danh mục'
        });
    }
};
