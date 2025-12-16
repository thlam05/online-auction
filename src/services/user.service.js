import userModel from "../models/user.model.js";
import pendingUserModel from "../models/pending-user.model.js";
import userRatingService from "./user-rating.service.js"
import { sendOtpEmail } from "../utils/nodemailer.js";
import bcrypt from "bcrypt";
import config from "../configs/config.js";

const userService = {
    async updateProfileInformation(user, rawData) {
        // rawData: { username, email, address }
        if (user.username === rawData.username && user.email === rawData.email && user.address === rawData.address && user.birthday === rawData.birthday) {
            return {
                status: 1,
                message: "No changes detected"
            }
        }
        if (user.email !== rawData.email) {
            const existingUser = await userModel.findByEmail(rawData.email);
            if (existingUser) {
                return {
                    status: 2,
                    message: "Email already in use"
                }
            }
        }

        user.username = rawData.username;
        user.address = rawData.address;
        user.birthday = rawData.birthday;
        user.updated_at = new Date(Date.now());
        const { id, ...data } = user;
        const [updateUser] = await userModel.updateOne(id, data);
        if (updateUser) {
            if (user.email != rawData.email) {
                const { otp, info } = await sendOtpEmail(rawData.email);
                const pendingUser = await pendingUserModel.findByEmail(rawData.email);
                if (pendingUser) {
                    const { id, ...pendingData } = pendingUser;
                    pendingData.expired_at = new Date(Date.now() + 5 * 60 * 1000);
                    pendingData.otp = otp;
                    pendingData.user_id = user.id;
                    pendingData.message = "Profile updated successfully. Please verify your new email.";
                    pendingData.redirect_to = "/auth/signin";
                    const [newPendingUser] = await pendingUserModel.updateOne(id, pendingData);
                    return {
                        status: 0,
                        message: "Profile updated successfully. Please verify your new email.",
                        data: newPendingUser
                    }
                }
                else {
                    const pendingData = {};
                    pendingData.email = rawData.email;
                    pendingData.otp = otp;
                    pendingData.user_id = user.id;
                    pendingData.message = "Profile updated successfully. Please verify your new email.";
                    pendingData.expired_at = new Date(Date.now() + 5 * 60 * 1000);
                    pendingData.updated_at = new Date(Date.now());
                    pendingData.redirect_to = "/auth/signin";
                    const [newPendingUser] = await pendingUserModel.createOne(pendingData);
                    return {
                        status: 3,
                        message: "Profile updated successfully. Please verify your new email.",
                        data: newPendingUser
                    }
                }
            }
            else {
                return {
                    status: 0,
                    message: "Successfully",
                    data: user
                }
            }
        }
        return {
            message: "Profile update failed",
            status: 1
        }
    },

    async updatePassword(user, rawData) {
        if (!bcrypt.compareSync(rawData.currentPassword, user.password)) {
            return {
                status: 1,
                message: "Incorrect password",
                error: true
            }
        }
        user.password = bcrypt.hashSync(rawData.password, config.saltRounds);
        user.updated_at = new Date(Date.now());
        const [updateUser] = await userModel.updateOne(user.id, { password: user.password, updated_at: user.updated_at });
        return {
            status: 0,
            message: "Successfully",
            data: user
        }
    },

    async getUserById(id) {
        const user = await userModel.findById(id);

        const { rating } = await userRatingService.getRatings(id);

        user.rating = rating;

        return user;
    }
};

export default userService;