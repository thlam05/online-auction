import nodemailer from "nodemailer";
import config from "../configs/config.js";

export const sendOtpEmail = async (toEmail) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: config.googleAppEmail,
            pass: config.googleAppPassword,
        },
    });

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

    const mailOptions = {
        from: `"Auction System" <${config.googleAppEmail}>`,
        to: toEmail,
        subject: "Mã OTP xác thực",
        text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
    };

    const info = await transporter.sendMail(mailOptions);

    return { otp, info };
}


export const sendInformMessage = async (toEmail, auction) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: config.googleAppEmail,
            pass: config.googleAppPassword,
        },
    });


    const mailOptions = {
        from: `"Auction System" <${config.googleAppEmail}>`,
        to: toEmail,
        subject: "Thông báo phiên đấu giá của bạn",
        text: `Phiên đấu giá ${auction.name} vừa nhận được một câu hỏi mới`,
        html: `
            <h3>Có người hỏi về phiên đấu giá của bạn</h3>
            <p>
                Phiên đấu giá <strong>${auction.name}</strong> vừa nhận được một câu hỏi mới.
            </p>
            <p>
                👉 <a href="http://localhost:3000/auctions/${auction.id}">Xem chi tiết sản phẩm</a>
            </p>
            <br/>
            <p>Trân trọng,<br/>Auction System</p>
        `,
    };

    const info = await transporter.sendMail(mailOptions);

    return { info };
}


function createTransport() {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: config.googleAppEmail,
            pass: config.googleAppPassword,
        },
    });

    return transporter;
}

export const sendBidSuccessToSeller = async (auction, seller) => {
    const transporter = createTransport();
    const auctionLink = `http://localhost:3000/auctions/${auction.id}`;

    const mailOptions = {
        from: `"Auction System" <${config.googleAppEmail}>`,
        to: seller.email,
        subject: "Có người ra giá cho sản phẩm của bạn",
        text: `Sản phẩm "${auction.name}" vừa được ra giá thành công.
            Giá mới hiện tại: ${auction.current_price} VNĐ.

            Xem chi tiết phiên đấu giá tại:
            ${auctionLink}`,
        html: `
            <p>🔔 <strong>Có người vừa ra giá cho sản phẩm của bạn</strong></p>
            <p>
                Sản phẩm: <strong>${auction.name}</strong><br/>
                Giá mới hiện tại: <strong>${auction.current_price} VNĐ</strong>
            </p>
            <p>
                👉 <a href="${auctionLink}">
                    Xem chi tiết phiên đấu giá
                </a>
            </p>
            <p>
                Bạn có thể theo dõi diễn biến hoặc thực hiện các hành động cần thiết
                trước khi phiên đấu giá kết thúc.
            </p>
        `,
    };

    const info = await transporter.sendMail(mailOptions);

    return { info };
}

export const sendBidSuccessToBidder = async (auction, bidder) => {
    const transporter = createTransport();

    const mailOptions = {
        from: `"Auction System" <${config.googleAppEmail}>`,
        to: bidder.email,
        subject: "Ra giá thành công",
        text: `Bạn đã ra giá thành công cho sản phẩm "${auction.name}".\nGiá của bạn: ${auction.current_price} VNĐ.`,
    };

    const info = await transporter.sendMail(mailOptions);

    return { info };
}

export const sendBidSuccessToPreHighestBidder = async (auction, preBidder) => {
    const transporter = createTransport();
    const auctionLink = `http://localhost:3000/auctions/${auction.id}`;

    const mailOptions = {
        from: `"Auction System" <${config.googleAppEmail}>`,
        to: preBidder.email,
        subject: "Bạn đã bị vượt giá",
        text: `Giá bạn đã đặt cho sản phẩm "${auction.name}" vừa bị vượt.
            Giá mới hiện tại: ${auction.current_price} VNĐ.

            Xem chi tiết và tiếp tục ra giá tại:
            ${auctionLink}`,
        html: `
            <p>🔔 <strong>Giá của bạn đã bị vượt</strong></p>
            <p>
                Giá bạn đã đặt cho sản phẩm
                <strong>${auction.name}</strong> vừa bị vượt.
            </p>
            <p>
                Giá hiện tại: <strong>${auction.current_price} VNĐ</strong>
            </p>
            <p>
                👉 <a href="${auctionLink}">
                    Xem chi tiết & tiếp tục ra giá
                </a>
            </p>
            <p>
                Đừng bỏ lỡ cơ hội — bạn vẫn có thể đặt giá cao hơn trước khi phiên đấu giá kết thúc.
            </p>
        `,
    };

    const info = await transporter.sendMail(mailOptions);

    return { info };
}


export const sendInformBlocked = async (auction, bidder) => {
    const transporter = createTransport();
    const auctionLink = `http://localhost:3000/auctions/${auction.id}`;

    const mailOptions = {
        from: `"Auction System" <${config.googleAppEmail}>`,
        to: bidder.email,
        subject: "Bạn đã bị người bán từ chối ra giá",
        text: `Bạn đã bị người bán từ chối quyền ra giá cho sản phẩm "${auction.name}".

        Bạn vẫn có thể xem chi tiết phiên đấu giá tại:
        ${auctionLink}`,
        html: `
            <p>⚠️ <strong>Quyền ra giá đã bị từ chối</strong></p>
            <p>
                Bạn không thể tiếp tục ra giá cho sản phẩm
                <strong>${auction.name}</strong> do quyết định từ người bán.
            </p>
            <p>
                👉 <a href="${auctionLink}">
                    Xem chi tiết phiên đấu giá
                </a>
            </p>
            <p>
                Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ với bộ phận hỗ trợ
                để được xem xét thêm.
            </p>
        `,
    };

    const info = await transporter.sendMail(mailOptions);

    return { info };
}

export const sendAuctionEndedNoBidToSeller = async (auction, seller) => {
    const transporter = createTransport();
    const auctionLink = `http://localhost:3000/auctions/${auction.id}`;

    const mailOptions = {
        from: `"Auction System" <${config.googleAppEmail}>`,
        to: seller.email,
        subject: "Đấu giá kết thúc – Không có người mua",
        text: `Phiên đấu giá cho sản phẩm "${auction.name}" đã kết thúc nhưng không có người mua.
            Xem chi tiết phiên đấu giá tại:
            ${auctionLink}`,
        html: `
        <p>ℹ️ <strong>Đấu giá đã kết thúc</strong></p>
        <p>
            Phiên đấu giá cho sản phẩm <strong>${auction.name}</strong>
            đã kết thúc nhưng <strong>không có người mua</strong>.
        </p>
        <p>
            👉 <a href="${auctionLink}">
                Xem chi tiết phiên đấu giá
            </a>
        </p>
        <p>
            Bạn có thể tạo lại phiên đấu giá mới hoặc điều chỉnh giá khởi điểm
            để tăng khả năng giao dịch thành công.
        </p>
    `
    };

    const info = await transporter.sendMail(mailOptions);

    return { info };
}

export const sendAuctionEndedToSeller = async (auction, seller) => {
    const transporter = createTransport();
    const auctionLink = `http://localhost:3000/auctions/${auction.id}`;

    const mailOptions = {
        from: `"Auction System" <${config.googleAppEmail}>`,
        to: seller.email,
        subject: "Đấu giá kết thúc thành công",
        text: `Sản phẩm "${auction.name}" đã được bán thành công.
            Giá chốt: ${auction.current_price} VNĐ.

            Xem chi tiết cuộc đấu giá tại:
            ${auctionLink}`,
        html: `
        <p>✅ <strong>Đấu giá kết thúc thành công</strong></p>
        <p>
            Sản phẩm: <strong>${auction.name}</strong><br/>
            Giá chốt: <strong>${auction.current_price} VNĐ</strong>
        </p>
        <p>
            👉 <a href="${auctionLink}">
                Xem chi tiết cuộc đấu giá
            </a>
        </p>
        <p>Vui lòng kiểm tra thông tin đơn hàng và tiến hành các bước tiếp theo.</p>
    `
    };

    const info = await transporter.sendMail(mailOptions);

    return { info };
}

export const sendAuctionEndedToWinner = async (auction, bidder) => {
    const transporter = createTransport();
    const auctionLink = `http://localhost:3000/auctions/${auction.id}`;

    const mailOptions = {
        from: `"Auction System" <${config.googleAppEmail}>`,
        to: bidder.email,
        subject: "Chúc mừng bạn đã thắng đấu giá",
        text:
            `Bạn đã thắng đấu giá sản phẩm "${auction.name}".
            Giá cuối cùng: ${auction.current_price} VNĐ.

            Xem chi tiết cuộc đấu giá tại:
            ${auctionLink}

            Vui lòng tiến hành thanh toán.`,
        html: `
            <p>🎉 <strong>Chúc mừng bạn đã thắng đấu giá!</strong></p>
            <p>
                Sản phẩm: <strong>${auction.name}</strong><br/>
                Giá cuối cùng: <strong>${auction.current_price} VNĐ</strong>
            </p>
            <p>
                👉 <a href="${auctionLink}">
                    Xem chi tiết cuộc đấu giá
                </a>
            </p>
            <p>Vui lòng tiến hành thanh toán để hoàn tất giao dịch.</p>
        `,
    };

    const info = await transporter.sendMail(mailOptions);

    return { info };
}

export const sendAuctionUpdatedToBidder = async (auction, bidder) => {
    const transporter = createTransport();
    const auctionLink = `http://localhost:3000/auctions/${auction.id}`;

    if (!bidder) return {};

    const mailOptions = {
        from: `"Auction System" <${config.googleAppEmail}>`,
        to: bidder.email,
        subject: "Thông tin sản phẩm đấu giá đã được cập nhật",
        text: `Thông tin của sản phẩm "${auction.name}" đã được người bán cập nhật.

Vui lòng xem lại chi tiết để đảm bảo quyết định ra giá của bạn vẫn phù hợp.

Xem chi tiết phiên đấu giá tại:
${auctionLink}`,
        html: `
            <p>✏️ <strong>Thông tin sản phẩm đã được cập nhật</strong></p>
            <p>
                Sản phẩm <strong>${auction.name}</strong> vừa được người bán
                cập nhật thông tin.
            </p>
            <p>
                👉 <a href="${auctionLink}">
                    Xem chi tiết phiên đấu giá
                </a>
            </p>
            <p>
                Vui lòng kiểm tra lại nội dung sản phẩm để đảm bảo quyền lợi của bạn
                trước khi tiếp tục ra giá.
            </p>
        `,
    };

    const info = await transporter.sendMail(mailOptions);

    return { info };
};