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

export default router;
