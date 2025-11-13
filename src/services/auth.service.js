import dp from "../configs/db.config.js";
import User from "../models/user.model.js";

const authService = {
    async signInWithEmail(rawData) {
        const user = await User.findByEmail(rawData.signInField);
        if (user == undefined) {
            return {
                message: "Email does not exist",
                status: 1
            }
        }
        if (rawData.password == user.password) {
            return {
                message: "Success",
                status: 0,
                data: user
            }
        }
        else {
            return {
                message: "Incorrect password",
                status: 2
            }
        }
    },
};

export default authService;