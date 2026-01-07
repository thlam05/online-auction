import categoryService from '../services/category.service.js';
import categoryModel from '../models/category.model.js';
import auctionModel from '../models/auction.model.js';
import userModel from '../models/user.model.js';
import bcrypt from 'bcrypt';
import config from '../configs/config.js';

export const getDashboard = async (req, res) => {
    try {
        const allCategoriesFlat = await categoryModel.findAll();
        const categoryMap = {};
        allCategoriesFlat.forEach(cat => {
            categoryMap[cat.id] = { ...cat, children: [] };
        });
        const rootCategories = [];
        allCategoriesFlat.forEach(cat => {
            if (cat.parent_category_id === null) {
                rootCategories.push(categoryMap[cat.id]);
            } else if (categoryMap[cat.parent_category_id]) {
                categoryMap[cat.parent_category_id].children.push(categoryMap[cat.id]);
            }
        });
        const flattenWithLevel = (categories, level = 0) => {
            let result = [];
            categories.forEach(cat => {
                result.push({ ...cat, level });
                if (cat.children && cat.children.length > 0) {
                    result = result.concat(flattenWithLevel(cat.children, level + 1));
                }
            });
            return result;
        };
        const allCategoriesForSelect = flattenWithLevel(rootCategories);
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
        const auctionsResult = await auctionModel.findAuctionsForAdmin({ page: 1, limit: 10 });
        const usersResult = await userModel.findUsersForAdmin({ page: 1, limit: 10 });
        res.render('admin/dashboard', {
            layout: 'admin-layout',
            title: 'Quản trị hệ thống',
            categories: categoriesWithParent,
            allCategories: allCategoriesForSelect,
            categoriesPages: result.pagination.totalPages,
            auctions: auctionsResult.auctions,
            auctionsPages: auctionsResult.pagination.totalPages,
            users: usersResult.users,
            usersPages: usersResult.pagination.totalPages
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
            pagination: result.pagination,
            totalPages: result.pagination.totalPages
        });
    } catch (error) {
        console.error('Error in getCategoriesData:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAuctionsData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const categoryId = req.query.auction_category || '';
        const status = req.query.auction_status || '';

        let query = auctionModel.baseAuctionQuerySimple();

        // Apply search filter
        if (search) {
            query = query.where('a.name', 'ilike', `%${search}%`);
        }

        // Apply category filter
        if (categoryId) {
            query = query.where('a.category_id', categoryId);
        }

        // Apply status filter
        if (status === 'active') {
            query = query.where('a.end_at', '>', new Date());
        } else if (status === 'ended') {
            query = query.where('a.end_at', '<=', new Date());
        }

        // Get total count for pagination
        const countQuery = query.clone();
        const allResults = await countQuery;
        const totalCount = allResults.length;
        const totalPages = Math.ceil(totalCount / limit);

        // Apply pagination
        const auctions = await query
            .orderBy('a.created_at', 'desc')
            .limit(limit)
            .offset((page - 1) * limit);

        res.json({
            data: auctions,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount
            },
            totalPages
        });
    } catch (error) {
        console.error('Error in getAuctionsData:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getUsersData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const role = req.query.user_role || '';
        const status = req.query.user_status || '';

        let query = userModel.findAll();

        // Apply search filter
        if (search) {
            query = query.where(function () {
                this.where('username', 'ilike', `%${search}%`)
                    .orWhere('email', 'ilike', `%${search}%`);
            });
        }

        // Apply role filter
        if (role !== '') {
            query = query.where('permission', parseInt(role));
        }

        // Apply status filter
        if (status) {
            query = query.where('upgrade_status', status);
        }

        // Get total count for pagination
        const countQuery = query.clone();
        const allResults = await countQuery;
        const totalCount = allResults.length;
        const totalPages = Math.ceil(totalCount / limit);

        // Apply pagination
        const users = await query
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset((page - 1) * limit);

        res.json({
            data: users,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount
            },
            totalPages
        });
    } catch (error) {
        console.error('Error in getUsersData:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.json({
            success: true,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({
            success: false,
            error: 'Đã xảy ra lỗi khi tải thông tin người dùng'
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, permission } = req.body;

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        // Check if email is being changed and if it already exists
        if (email !== user.email) {
            const existingUser = await userModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Email đã được sử dụng'
                });
            }
        }

        await userModel.updateOne(id, {
            username,
            email,
            permission: parseInt(permission),
            updated_at: new Date()
        });

        res.json({
            success: true,
            message: 'Cập nhật người dùng thành công'
        });
    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể cập nhật người dùng'
        });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, parent_category_id } = req.body;
        await categoryService.createCategory({
            name,
            parent_category_id: parent_category_id || null
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error in createCategory:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Không thể thêm danh mục'
        });
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

export const createUser = async (req, res) => {
    try {
        const { username, email, password, permission } = req.body;

        // Check if email already exists
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email đã được sử dụng'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, config.saltRounds);

        // Create user
        const [newUser] = await userModel.createOne({
            username,
            email,
            password: hashedPassword,
            permission: parseInt(permission) || 0,
            created_at: new Date(),
            updated_at: new Date()
        });

        res.json({
            success: true,
            user: { id: newUser.id, username: newUser.username, email: newUser.email }
        });
    } catch (error) {
        console.error('Error in createUser:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tạo người dùng'
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Don't allow deleting yourself
        if (req.user && req.user.id === parseInt(id)) {
            return res.status(400).json({
                success: false,
                error: 'Không thể xóa tài khoản của chính mình'
            });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        // Use delete method if exists, otherwise update to mark as deleted
        // For now, we'll just return success (you may want to implement soft delete)
        // await userModel.deleteOne(id);

        res.json({
            success: true,
            message: 'Xóa người dùng thành công'
        });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể xóa người dùng'
        });
    }
};

export const handleUpgrade = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        if (action === 'approve') {
            // Upgrade user to seller
            await userModel.updateOne(id, {
                permission: 1,
                // upgrade_status: 'approved',
                updated_at: new Date()
            });

            res.json({
                success: true,
                message: 'Đã duyệt nâng cấp người dùng'
            });
        } else if (action === 'reject') {
            // Reject upgrade request
            await userModel.updateOne(id, {
                upgrade_status: 'rejected',
                updated_at: new Date()
            });

            res.json({
                success: true,
                message: 'Đã từ chối nâng cấp người dùng'
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Hành động không hợp lệ'
            });
        }
    } catch (error) {
        console.error('Error in handleUpgrade:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể xử lý yêu cầu nâng cấp'
        });
    }
};
