import express from 'express';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

// Admin Dashboard
router.get('/', adminController.getDashboard);

// Admin Categories Management
router.get('/categories', adminController.getCategories);

// Admin Auctions Management
router.get('/auctions', adminController.getAuctions);

// Admin Users Management
router.get('/users', adminController.getUsers);

export default router;
