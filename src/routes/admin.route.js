import express from 'express';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/', adminController.getDashboard);

// Categories
router.get('/categories/data', adminController.getCategoriesData);
router.get('/categories/:id', adminController.getCategoryById);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Auctions
router.get('/auctions/data', adminController.getAuctionsData);
router.get('/auctions/:id', adminController.getAuctionById);
router.delete('/auctions/:id', adminController.deleteAuction);

router.get('/users/data', adminController.getUsersData);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/approve', adminController.approveUpgrade);
router.post('/users/reject', adminController.rejectUpgrade);

export default router;
