// Admin Dashboard - hiển thị cả 3 bảng: categories, auctions, users
export const getDashboard = async (req, res) => {
    try {
        // TODO: Lấy data cho 3 bảng từ database
        // const categories = await categoryService.findAll();
        // const auctions = await auctionService.findAll();
        // const users = await userService.findAll();

        res.render('admin/dashboard', {
            layout: 'admin-layout',
            title: 'Quản trị hệ thống',
            // categories,
            // auctions,
            // users
        });
    } catch (error) {
        console.error('Error in getDashboard:', error);
        res.status(500).render('error/500');
    }
};
