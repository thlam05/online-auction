// Admin Categories Controller
export const getCategories = async (req, res) => {
    try {
        res.render('admin/categories', {
            layout: 'admin-layout',
            title: 'Quản lý danh mục'
        });
    } catch (error) {
        console.error('Error in getCategories:', error);
        res.status(500).render('error/500');
    }
};

// Admin Auctions Controller
export const getAuctions = async (req, res) => {
    try {
        res.render('admin/auctions', {
            layout: 'admin-layout',
            title: 'Quản lý sản phẩm'
        });
    } catch (error) {
        console.error('Error in getAuctions:', error);
        res.status(500).render('error/500');
    }
};

// Admin Users Controller
export const getUsers = async (req, res) => {
    try {
        res.render('admin/users', {
            layout: 'admin-layout',
            title: 'Quản lý người dùng'
        });
    } catch (error) {
        console.error('Error in getUsers:', error);
        res.status(500).render('error/500');
    }
};

// Admin Dashboard
export const getDashboard = async (req, res) => {
    try {
        res.render('admin/dashboard', {
            layout: 'admin-layout',
            title: 'Dashboard'
        });
    } catch (error) {
        console.error('Error in getDashboard:', error);
        res.status(500).render('error/500');
    }
};
