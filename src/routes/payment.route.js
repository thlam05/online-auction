import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.get('/:auctionId', paymentController.getPaymentPage);
router.post('/:auctionId/submit-payment', upload.single('payment_proof'), paymentController.submitPayment);
router.post('/:auctionId/confirm-payment', paymentController.confirmPayment);
router.post('/:auctionId/cancel', paymentController.cancelOrder);

export default router;
