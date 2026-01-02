import express from 'express';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

// Admin Dashboard - hiển thị tất cả categories, auctions, users trong 1 trang
router.get('/', adminController.getDashboard);

export default router;
