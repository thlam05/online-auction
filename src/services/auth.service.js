import User from "../models/user.model.js";
import PendingUser from "../models/pending-user.model.js";
import bcrypt from "bcrypt";
import config from "../configs/config.js";

const authService = {
    async signInWithEmail(rawData) {
        // rawData: { signInField, password }
        const user = await User.findByEmail(rawData.signInField);
        if (user == undefined) {
            const pendingUser = await PendingUser.findByEmail(rawData.signInField);
            if (pendingUser != undefined) {
                return {
                    message: "Account not verified. Please check your email for the OTP to verify your account.",
                    status: 3,
                    data: pendingUser
                }
            }
            return {
                message: "Incorrect Email or password",
                status: 1
            }
        }
        if (bcrypt.compareSync(rawData.password, user.password)) {
            return {
                message: "Success",
                status: 0,
                data: user
            }
        }
        else {
            return {
                message: "Incorrect Email or password",
                status: 2
            }
        }
    },

    async isExitingUserByEmail(email) {
        const existingUser = await User.findByEmail(email);
        if (existingUser != undefined) {
            return {
                message: "Email already in use",
                status: 1
            }
        }
        else {
            return {
                message: "Email available",
                status: 0
            }
        }
    },

    async savePendingUser(rawData) {
        // rawData: { username, email, address, password, otp }
        const hashedPassword = bcrypt.hashSync(rawData.password, config.saltRounds);
        const pendingUser = await PendingUser.findByEmail(rawData.email);
        if (pendingUser != undefined) {
            pendingUser.otp = rawData.otp;
            pendingUser.expired_at = new Date(Date.now() + 5 * 60 * 1000);
            pendingUser.username = rawData.username;
            pendingUser.address = rawData.address;
            pendingUser.password = hashedPassword;
            await PendingUser.updateOne(pendingUser.id, {
                username: pendingUser.username,
                address: pendingUser.address,
                password: pendingUser.password,
                otp: pendingUser.otp,
                expired_at: pendingUser.expired_at
            });
            return {
                message: "Success",
                status: 0,
                data: pendingUser
            }
        }

        const row = await PendingUser.createOne({
            username: rawData.username,
            email: rawData.email,
            address: rawData.address,
            password: hashedPassword,
            otp: rawData.otp,
            created_at: new Date(Date.now()),
            expired_at: new Date(Date.now() + 5 * 60 * 1000)
        });
        const newPendingUser = row[0];
        return {
            message: "Success",
            status: 0,
            data: newPendingUser
        }
    },

    async createUserFromPending(pendingUser) {
        const row = await User.createOne({
            username: pendingUser.username,
            email: pendingUser.email,
            address: pendingUser.address,
            password: pendingUser.password,
            permission: 0,
            created_at: new Date(Date.now()),
            updated_at: new Date(Date.now())
        });
        await PendingUser.deleteOne(pendingUser.id);
        const newUser = row[0];
        return {
            message: "Success",
            status: 0,
            data: newUser
        }
    }

};

export default authService;