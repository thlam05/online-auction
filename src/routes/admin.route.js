import express from 'express';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/', adminController.getDashboard);

router.get('/categories/data', adminController.getCategoriesData);
router.get('/categories/:id', adminController.getCategoryById);
router.post('/categories', adminController.createCategory);
router.delete('/categories/:id', adminController.deleteCategory);

export default router;
