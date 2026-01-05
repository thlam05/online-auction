import categoryService from '../services/category.service.js';
import categoryModel from '../models/category.model.js';
import auctionService from '../services/auction.service.js';
import auctionModel from '../models/auction.model.js';
import userModel from '../models/user.model.js';
import pendingUserModel from '../models/pending-user.model.js';
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
export const getAuctionsData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const categoryId = req.query.category || '';
        const status = req.query.status || '';
        const result = await auctionModel.findAuctionsForAdmin({
            page,
            limit,
            search,
            categoryId,
            status
        });
        res.json({
            data: result.auctions,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error in getAuctionsData:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const getAuctionById = async (req, res) => {
    try {
        const { id } = req.params;
        const auction = await auctionService.getAuctionById(id);
        if (!auction) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy sản phẩm đấu giá'
            });
        }
        res.json({
            success: true,
            auction
        });
    } catch (error) {
        console.error('Error in getAuctionById:', error);
        res.status(500).json({
            success: false,
            error: 'Đã xảy ra lỗi khi tải thông tin sản phẩm'
        });
    }
};
export const deleteAuction = async (req, res) => {
    try {
        const { id } = req.params;
        const auction = await auctionModel.findById(id);
        if (!auction) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy sản phẩm đấu giá'
            });
        }
        await auctionModel.deleteById(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in deleteAuction:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Không thể xóa sản phẩm đấu giá'
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
                error: 'Email đã tồn tại'
            });
        }

        // Hash password
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await userModel.createOne({
            username,
            email,
            password: hashedPassword,
            permission: parseInt(permission) || 0,
            created_at: new Date()
        });

        res.json({
            success: true,
            user: newUser[0]
        });
    } catch (error) {
        console.error('Error in createUser:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Không thể tạo người dùng'
        });
    }
};

export const getUsersData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const role = req.query.role || '';
        const status = req.query.status || '';

        const result = await userModel.findUsersForAdmin({
            page,
            limit,
            search,
            role,
            status
        });

        res.json({
            data: result.users,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error in getUsersData:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const approveUpgrade = async (req, res) => {
    try {
        const { userId } = req.body;

        await userModel.updateOne(userId, { permission: 1 });
        await pendingUserModel.deleteByUserId(userId);

        res.json({ success: true });
    } catch (error) {
        console.error('Error in approveUpgrade:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Không thể duyệt nâng cấp tài khoản'
        });
    }
};

export const rejectUpgrade = async (req, res) => {
    try {
        const { userId } = req.body;

        await pendingUserModel.deleteByUserId(userId);

        res.json({ success: true });
    } catch (error) {
        console.error('Error in rejectUpgrade:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Không thể từ chối nâng cấp tài khoản'
        });
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

        // Get pending upgrade request if exists
        const pendingRequest = await pendingUserModel.findByUserId(id);

        res.json({
            success: true,
            user: {
                ...user,
                pending_request: pendingRequest
            }
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

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (permission !== undefined) updateData.permission = parseInt(permission);
        updateData.updated_at = new Date();

        const result = await userModel.updateOne(id, updateData);

        // If user is upgraded to seller, remove any pending request
        if (parseInt(permission) === 1) {
            await pendingUserModel.deleteByUserId(id);
        }

        res.json({
            success: true,
            user: result[0] || result
        });
    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Không thể cập nhật người dùng'
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        // Don't allow deleting admin users
        if (user.permission === 2) {
            return res.status(400).json({
                success: false,
                error: 'Không thể xóa tài khoản quản trị viên'
            });
        }

        // Delete related records first
        await pendingUserModel.deleteByUserId(id);

        // Delete the user
        await userModel.deleteOne(id);

        res.json({ success: true });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Không thể xóa người dùng'
        });
    }
};