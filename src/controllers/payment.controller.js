import auctionService from '../services/auction.service.js';
import bidService from '../services/bid.service.js';
import userService from '../services/user.service.js';
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
        if (auction.is_active) {
            return res.redirect(`/auctions/${auctionId}`);
        }
        const winner = auction.highestBidder;
        if (!winner) {
            return res.redirect(`/auctions/${auctionId}`);
        }
        const isSeller = auction.seller_id === userId;
        const isWinner = winner.id === userId;
        if (!isSeller && !isWinner) {
            return res.redirect(`/auctions/${auctionId}`);
        }
        const currentStep = 1;
        const orderStatus = 'pending_payment';
        const seller = await userService.getUserById(auction.seller_id);
        let otherParty;
        if (isSeller) {
            otherParty = winner;
        } else {
            otherParty = seller;
        }
        res.render('payment/index', {
            layout: 'main',
            title: 'Hoàn tất đơn hàng',
            auction: {
                ...auction,
                main_image: auction.mainImage?.image_url || '/images/placeholder.webp',
                seller: seller
            },
            winner,
            isSeller,
            isWinner,
            currentStep,
            orderStatus,
            otherParty
        });
    } catch (error) {
        console.error('Error in getPaymentPage:', error);
        res.status(500).render('error/500', {
            layout: 'main',
            title: 'Lỗi hệ thống'
        });
    }
};
