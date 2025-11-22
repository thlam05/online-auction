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
        from: config.googleAppEmail,
        to: toEmail,
        subject: "Mã OTP xác thực",
        text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
    };

    const info = await transporter.sendMail(mailOptions);

    return { otp, info };
}