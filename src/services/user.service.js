import e from "express";
import dp from "../configs/db.config.js";
import User from "../models/user.model.js";


const userService = {
    async updateProfileInformation(user, rawData) {
        // rawData: { username, email, address }
        if (user.username === rawData.username && user.email === rawData.email && user.address === rawData.address) {
            return {
                message: "No changes detected",
                status: 1
            }
        }
        let verifyOtp = false;
        if (user.email !== rawData.email) {
            const existingUser = await User.findByEmail(rawData.email);
            if (existingUser != undefined) {
                return {
                    message: "Email already in use",
                    status: 2
                }
            }
            else {
                verifyOtp = true;
            }
        }
        user.username = rawData.username;
        user.email = rawData.email;
        user.address = rawData.address;
        const { id, ...data } = user;
        const count = await User.updateOne(id, data);
        if (count > 0) {
            if (verifyOtp) {
                return {
                    message: "Profile updated successfully. Please verify your new email.",
                    status: 3
                }
            }
            return {
                message: "Profile updated successfully",
                status: 0
            }
        } else {
            return {
                message: "Profile update failed",
                status: 1
            }
        }
    }
};

export default userService;