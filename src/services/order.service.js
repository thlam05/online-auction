import orderModel from "../models/order.model.js";
const orderService = {
    async getOrCreateOrder(auction_id, seller_id, buyer_id, final_price) {
        let order = await orderModel.findByAuctionId(auction_id);
        if (!order) {
            const [newOrder] = await orderModel.createOne({
                auction_id,
                seller_id,
                buyer_id,
                final_price,
                status: 'pending_payment',
                created_at: new Date()
            });
            order = newOrder;
        }
        return order;
    },
    async getOrderByAuctionId(auction_id) {
        return await orderModel.findByAuctionId(auction_id);
    },
    async submitPayment(order_id, buyer_id, payment_proof) {
        const order = await orderModel.findById(order_id);
        if (!order) {
            return { success: false, message: 'Không tìm thấy đơn hàng' };
        }
        if (order.buyer_id !== buyer_id) {
            return { success: false, message: 'Bạn không có quyền thực hiện thao tác này' };
        }
        if (order.status !== 'pending_payment') {
            return { success: false, message: 'Đơn hàng đã được xử lý' };
        }
        const [updated] = await orderModel.update(order_id, {
            payment_proof,
            updated_at: new Date()
        });
        return { success: true, order: updated, message: 'Đã gửi bằng chứng thanh toán' };
    },
    async confirmPayment(order_id, seller_id) {
        const order = await orderModel.findById(order_id);
        if (!order) {
            return { success: false, message: 'Không tìm thấy đơn hàng' };
        }
        if (order.seller_id !== seller_id) {
            return { success: false, message: 'Bạn không có quyền thực hiện thao tác này' };
        }
        if (order.status !== 'pending_payment') {
            return { success: false, message: 'Đơn hàng đã được xử lý' };
        }
        if (!order.payment_proof) {
            return { success: false, message: 'Người mua chưa gửi bằng chứng thanh toán' };
        }
        const [updated] = await orderModel.update(order_id, {
            status: 'completed',
            completed_at: new Date(),
            updated_at: new Date()
        });
        return { success: true, order: updated, message: 'Đã hoàn tất đơn hàng' };
    },
    async cancelOrder(order_id, seller_id) {
        const order = await orderModel.findById(order_id);
        if (!order) {
            return { success: false, message: 'Không tìm thấy đơn hàng' };
        }
        if (order.seller_id !== seller_id) {
            return { success: false, message: 'Bạn không có quyền thực hiện thao tác này' };
        }
        if (order.status === 'completed') {
            return { success: false, message: 'Không thể huỷ đơn hàng đã hoàn tất' };
        }
        if (order.status === 'cancelled') {
            return { success: false, message: 'Đơn hàng đã được huỷ trước đó' };
        }
        const [updated] = await orderModel.update(order_id, {
            status: 'cancelled',
            cancelled_at: new Date(),
            updated_at: new Date()
        });
        return { success: true, order: updated, message: 'Đã huỷ giao dịch' };
    }
};
export default orderService;
