import auctionService from '../services/auction.service.js';
import userService from '../services/user.service.js';
import orderService from '../services/order.service.js';
import bidModel from '../models/bid.model.js';
import orderMessageModel from '../models/order-message.model.js';
import userRatingService from '../services/user-rating.service.js';

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

        const sellerId = auction.seller_id || auction.seller?.id;

        if (!sellerId) {
            console.error('Seller ID not found for auction:', auctionId);
            return res.status(500).render('error/500', {
                layout: 'main',
                title: 'Lỗi hệ thống'
            });
        }

        const isSeller = sellerId === userId;
        const isWinner = winner.id === userId;

        console.log('sellerId:', sellerId, 'userId:', userId);
        console.log('isSeller:', isSeller, 'isWinner:', isWinner);

        if (!isSeller && !isWinner) {
            return res.redirect(`/auctions/${auctionId}`);
        }

        const order = await orderService.getOrCreateOrder(
            auctionId,
            sellerId,
            winner.id,
            auction.current_price
        );

        if (order.status === 'cancelled') {
            return res.render('payment/cancelled', {
                layout: 'main',
                title: 'Giao dịch đã bị huỷ',
                auction: {
                    ...auction,
                    main_image: auction.mainImage?.url || '/images/placeholder.webp'
                },
                order,
                isSeller,
                isWinner
            });
        }

        const messages = await orderMessageModel.getByOrderId(order.id);

        const seller = await userService.getUserById(sellerId);

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
            seller,
            isSeller,
            isWinner,
            orderStatus: order.status,
            messages
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

        // Redirect back to payment page instead of returning JSON
        return res.redirect(`/payment/${auctionId}`);
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

        // Redirect back to payment page instead of returning JSON
        return res.redirect(`/payment/${auctionId}`);
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

        // Only seller can cancel
        if (order.seller_id !== userId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền huỷ đơn hàng này' });
        }

        // Give -1 rating to buyer
        // TODO: Fix user_ratings table column name (comment -> content)
        // await userRatingService.createOne({
        //     rater_id: userId,
        //     rated_id: order.buyer_id,
        //     auction_id: auctionId,
        //     rating: '-1',
        //     content: 'Người mua không hoàn thành thanh toán'
        // });

        const result = await orderService.cancelOrder(order.id, userId);

        return res.json(result);
    } catch (error) {
        console.error('Error in cancelOrder:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

// POST /payment/:auctionId/send-message - Send chat message
export const sendMessage = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || content.trim() === '') {
            return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
        }

        const order = await orderService.getOrderByAuctionId(auctionId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // Only seller and buyer can send messages
        if (order.seller_id !== userId && order.buyer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền gửi tin nhắn' });
        }

        const [message] = await orderMessageModel.createOne({
            order_id: order.id,
            sender_id: userId,
            content: content.trim(),
            created_at: new Date()
        });

        return res.json({
            success: true,
            message: {
                ...message,
                sender_name: req.user.username
            }
        });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

// GET /payment/:auctionId/messages - Get chat messages
export const getMessages = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const userId = req.user.id;

        const order = await orderService.getOrderByAuctionId(auctionId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // Only seller and buyer can view messages
        if (order.seller_id !== userId && order.buyer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xem tin nhắn' });
        }

        const messages = await orderMessageModel.getByOrderId(order.id);

        return res.json({ success: true, messages });
    } catch (error) {
        console.error('Error in getMessages:', error);
        return res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};