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

    const mailOptions = {
        from: `"Auction System" <${config.googleAppEmail}>`,
        to: seller.email,
        subject: "Có người ra giá cho sản phẩm của bạn",
        text: `Sản phẩm "${auction.name}" vừa được ra giá thành công.\nGiá mới: ${auction.current_price} VNĐ.`,
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

    const mailOptions = {
        from: `"Auction System" <${config.googleAppEmail}>`,
        to: preBidder.email,
        subject: "Bạn đã bị vượt giá",
        text: `Giá của bạn cho sản phẩm "${auction.name}" đã bị vượt.\nGiá mới hiện tại: ${auction.current_price} VNĐ.`,
    };

    const info = await transporter.sendMail(mailOptions);

    return { info };
}


export const sendInformBlocked = async (auction, bidder) => {
    const transporter = createTransport();

    const mailOptions = {
        from: `"Auction System" <${config.googleAppEmail}>`,
        to: bidder.email,
        subject: "Bạn đã bị người bán từ chối ra giá",
        text: `Bạn không thể ra giá cho sản phẩm "${auction.name}"`,
    };

    const info = await transporter.sendMail(mailOptions);

    return { info };
}
