import nodemailer from "nodemailer";
import config from "../configs/config.js";

export async function sendOtpEmail(toEmail) {
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


export async function sendInformMessage(toEmail, auction) {
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