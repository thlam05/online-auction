import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';

const router = express.Router();

router.get('/:auctionId', paymentController.getPaymentPage);

export default router;
