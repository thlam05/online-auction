import auctionService from '../services/auction.service.js';
import userService from '../services/user.service.js';
import orderService from '../services/order.service.js';
import bidModel from '../models/bid.model.js';

// GET /payment/:auctionId - Main payment page
export const getPaymentPage = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user.id;

        const auction = await auctionService.getAuctionById(auctionId);

        if (!auction) {
            return res.status(404).render('error/404', {
                layout: 'main',
                title: 'Không tìm thấy'
            });
        }

        const endTime = new Date(auction.end_at).getTime();
        const now = Date.now();
        if (endTime > now + 5000) {
            return res.redirect(`/auctions/${auctionId}`);
        }

        const winner = await bidModel.getHighestBidder(auctionId);

        if (!winner) {

            return res.redirect(`/auctions/${auctionId}`);
        }

        const isSeller = auction.seller_id === userId;
        const isWinner = winner.id === userId;

        console.log('isSeller:', isSeller, 'isWinner:', isWinner);

        if (!isSeller && !isWinner) {
            return res.redirect(`/auctions/${auctionId}`);
        }

        const order = await orderService.getOrCreateOrder(
            auctionId,
            auction.seller_id,
            winner.id,
            auction.current_price
        );

        const seller = await userService.getUserById(auction.seller_id);

        res.render('payment/index', {
            layout: 'main',
            title: 'Thanh toán',
            auction: {
                ...auction,
                main_image: auction.mainImage?.url || '/images/placeholder.webp',
                seller: seller
            },
            order,
            winner,
            isSeller,
            isWinner,
            orderStatus: order.status
        });
    } catch (error) {
        console.error('Error in getPaymentPage:', error);
        res.status(500).render('error/500', {
            layout: 'main',
            title: 'Lỗi hệ thống'
        });
    }
};

// POST /payment/:auctionId/submit-payment - Buyer submits payment proof
export const submitPayment = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user.id;

        const order = await orderService.getOrderByAuctionId(auctionId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        let payment_proof = null;
        if (req.file) {
            payment_proof = `/uploads/${req.file.filename}`;
        }

        if (!payment_proof) {
            return res.status(400).json({ success: false, message: 'Vui lòng tải lên bằng chứng thanh toán' });
        }

        const result = await orderService.submitPayment(order.id, userId, payment_proof);

        return res.json(result);
    } catch (error) {
        console.error('Error in submitPayment:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

// POST /payment/:auctionId/confirm-payment - Seller confirms payment
export const confirmPayment = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user.id;

        const order = await orderService.getOrderByAuctionId(auctionId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const result = await orderService.confirmPayment(order.id, userId);

        return res.json(result);
    } catch (error) {
        console.error('Error in confirmPayment:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

// POST /payment/:auctionId/cancel - Seller cancels order
export const cancelOrder = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user.id;

        const order = await orderService.getOrderByAuctionId(auctionId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        const result = await orderService.cancelOrder(order.id, userId);

        return res.json(result);
    } catch (error) {
        console.error('Error in cancelOrder:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};