import userModel from "../models/user.model.js";
import PendingUser from "../models/pending-user.model.js";
import bcrypt from "bcrypt";
import config from "../configs/config.js";
import { sendOtpEmail } from "../utils/nodemailer.js"
import pendingUserModel from "../models/pending-user.model.js";

const authService = {
    async signInWithEmail(rawData) {
        const user = await userModel.findByEmail(rawData.signInField);
        if (user == undefined) {
            return {
                message: "Email hoặc mật khẩu không chính xác",
                status: 1
            }
        }
        if (await bcrypt.compare(rawData.password, user.password)) {
            if (user.is_verified == false) {
                return {
                    status: 2,
                    message: "Vui lòng xác thực OTP để đăng nhập",
                    data: user
                }
            }
            return {
                message: "Thành công",
                status: 0,
                data: user
            }
        }
        else {
            return {
                message: "Email hoặc mật khẩu không chính xác",
                status: 1
            }
        }
    },

    async signUpWithEmail(data) {
        const isExistEmail = await userModel.findByEmail(data.email);
        if (isExistEmail) {
            return {
                status: 1,
                message: "Email đã tồn tại",
                data: isExistEmail
            }
        }
        data.password = await bcrypt.hash(data.password, config.saltRounds);
        data.created_at = new Date(Date.now());
        data.updated_at = new Date(Date.now());
        data.permission = 0;
        data.is_verified = false;
        const [userCreate] = await userModel.createOne(data);
        const { otp, info } = await sendOtpEmail(userCreate.email);
        const pendingData = {
            user_id: userCreate.id,
            email: userCreate.email,
            otp: otp,
            created_at: new Date(Date.now()),
            expired_at: new Date(Date.now() + 5 * 60 * 1000),
            message: "Vui lòng xác thực mã OTP được gửi đến email của bạn để hoàn tất đăng ký",
            redirect_to: "/auth/signin"
        }
        const [pendingUser] = await pendingUserModel.createOne(pendingData);
        return {
            status: 0,
            message: "Thành công",
            data: pendingUser
        }
    },

    async signInWithGoogle(data) {
        const user = await userModel.findByGoogleId(data.google_id);
        if (!user) {
            const userByEmail = await userModel.findByEmail(data.email);
            if (!userByEmail) {
                const userData = {};
                userData.email = data.email;
                userData.google_id = data.google_id;
                userData.username = data.username;
                userData.created_at = new Date(Date.now());
                userData.updated_at = new Date(Date.now());
                userData.is_verified = true;
                userData.permission = 0;
                const [newUser] = await userModel.createOne(userData);
                return {
                    status: 0,
                    message: "Thành công",
                    data: newUser
                }
            }
            else {
                const { id, ...userData } = userByEmail;
                userData.google_id = data.google_id;
                userData.is_verified = true;
                const [updatedUser] = await userModel.updateOne(id, userData);
                await pendingUserModel.deleteByEmail(userData.email);
                return {
                    status: 0,
                    message: "Thành công",
                    data: updatedUser
                }
            }
        }
        return {
            status: 0,
            message: "Thành công",
            data: user
        }
    },

    async signInWithFaceBook(data) {
        const user = await userModel.findByFacebookId(data.facebook_id);
        if (!user) {
            const userData = {};
            userData.username = data.username;
            userData.facebook_id = data.facebook_id;
            userData.created_at = new Date(Date.now());
            userData.updated_at = new Date(Date.now());
            userData.permission = 0;
            const newUser = await userModel.createOne(userData);
            return {
                status: 0,
                message: "Thành công",
                data: newUser
            }
        }
        return {
            status: 0,
            message: "Thành công",
            data: user
        }
    },

    async verifyUser(pendingUser) {
        const userId = pendingUser.user_id;
        let user = await userModel.findById(userId);
        if (!user) {
            return {
                status: 1,
                message: "Không tìm thấy người dùng",
                error: true
            }
        }
        user.is_verified = true;
        user = await userModel.updateOne(user.id, { is_verified: user.is_verified, email: pendingUser.email, updated_at: new Date(Date.now()) });
        await pendingUserModel.deleteOne(pendingUser.id);
        return {
            status: 0,
            message: "Thành công",
            data: user
        }
    },

    async savePendingUser(user, message) {
        const pendingUser = await pendingUserModel.findByUserId(user.id);
        const { otp, info } = await sendOtpEmail(user.email);
        if (!pendingUser) {
            const pendingData = {
                user_id: user.id,
                email: user.email,
                otp: otp,
                created_at: new Date(Date.now()),
                expired_at: new Date(Date.now() + 5 * 60 * 1000),
                message: message,
                redirect_to: "/auth/signin"
            }
            const [newPendingUser] = await pendingUserModel.createOne(pendingData);
            return {
                status: 0,
                message: "Thành công",
                data: newPendingUser
            }
        }
        else {
            const { id, ...pendingData } = pendingUser;
            pendingData.expired_at = new Date(Date.now() + 5 * 60 * 1000);
            pendingData.otp = otp;
            pendingData.message = message;
            pendingData.redirect_to = "/auth/signin";
            const [newPendingUser] = await pendingUserModel.updateOne(id, pendingData);
            return {
                status: 0,
                message: "Thành công",
                data: newPendingUser
            }
        }
    },

    async checkExistEmail(email) {
        const user = await userModel.findByEmail(email);
        if (!user) {
            return {
                status: 1,
                message: "Email không tồn tại"
            }
        }
        const { otp, info } = await sendOtpEmail(email);
        const pendingData = {
            user_id: user.id,
            email: email,
            otp: otp,
            expired_at: new Date(Date.now() + 5 * 60 * 1000),
            created_at: new Date(Date.now()),
            message: "Vui lòng xác thực OTP để khôi phục mật khẩu",
            redirect_to: `/auth/recovery-password?userId=${user.id}`
        }
        const [newPendingUser] = await pendingUserModel.createOne(pendingData);
        return {
            status: 0,
            message: "Email tồn tại",
            data: newPendingUser
        }
    },

    async recoveryPassword(userId, password) {
        const user = await userModel.findById(userId);
        if (!user) {
            return {
                status: 1,
                message: "Không tìm thấy người dùng"
            }
        }
        const hashedPassword = await bcrypt.hash(password, config.saltRounds);
        const [updatedUser] = await userModel.updateOne(userId, { password: hashedPassword });
        if (!updatedUser) {
            return {
                status: 1,
                message: "Cập nhật mật khẩu thất bại"
            }
        }
        return {
            status: 0,
            message: "Thành công",
            data: updatedUser
        }
    },

    async checkExistingEmail(email) {
        return await userModel.findByEmail(email);
    }
};

export default authService;