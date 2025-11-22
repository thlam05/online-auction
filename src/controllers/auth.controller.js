import passport from "../configs/passport.config.js";
import authService from "../services/auth.service.js";
import PendingUser from "../models/pending-user.model.js";
import { sendOtpEmail } from "../utils/nodemailer.js";

class AuthController {
    //  GET - /auth/login
    getSignIn(req, res, next) {
        res.render("auth/signin");
    }

    // GET - /auth/signup
    getSignUp(req, res, next) {
        res.render("auth/signup");
    }

    // GET - /auth/otp-verify
    getOtpVerify(req, res, next) {
        const { email, pendingUserId } = req.query;
        res.render("auth/otp-verify", { email, pendingUserId });
    }


    // POST - /auth/signin
    signIn(req, res, next) {
        passport.authenticate('local', async (err, user, info) => {
            console.log("Authentication info:", info);
            if (err) { return next(err); }
            if (!user) {
                if (info && info.status === 3) {
                    const { otp, result } = await sendOtpEmail(info.data.email);
                    const rawData = info.data;
                    rawData.otp = otp;
                    const saveResult = await authService.savePendingUser(rawData);
                    return res.redirect(`/auth/otp-verify?email=${req.body.email}&pendingUserId=${saveResult.data.id}`);
                }
                return res.render("auth/signin", { data: req.body, message: info.message, error: true });
            }

            req.logIn(user, (err) => {
                if (err) return next(err);
                return res.redirect('/');
            });
        })(req, res, next);
    }

    // POST - /auth/logout
    logout(req, res, next) {
        req.logout(function (err) {
            if (err) { return next(err); }
            res.redirect('/');
        });
    }

    // POST - /auth/signup
    async signUp(req, res, next) {
        const result = await authService.isExitingUserByEmail(req.body.email);
        if (result.status === 0) {
            const { otp, info } = await sendOtpEmail(req.body.email);
            const rawData = req.body;
            rawData.otp = otp;
            const saveResult = await authService.savePendingUser(rawData);
            res.redirect(`/auth/otp-verify?email=${req.body.email}&pendingUserId=${saveResult.data.id}`);
        }
        else {
            res.render("auth/signup", { data: req.body, message: result.message, error: true });
        }
    }

    // POST - /auth/otp-verify
    async verifyOtp(req, res, next) {
        const { otp, pendingUserId } = req.body;
        const pendingUser = await PendingUser.findById(pendingUserId);
        if (pendingUser == undefined) {
            return res.render("/auth/otp-verify", { email: req.body.email, pendingUserId, message: "Invalid pending user. Please sign up again.", error: true });
        }
        if (pendingUser.expired_at < new Date(Date.now())) {
            return res.render("auth/otp-verify", { email: req.body.email, pendingUserId, message: "OTP has expired. Please resend code again.", error: true });
        }
        if (pendingUser.otp != otp) {
            return res.render("auth/otp-verify", { email: req.body.email, pendingUserId, message: "Incorrect OTP. Please try again.", error: true });
        }
        const createResult = await authService.createUserFromPending(pendingUser);
        res.render("auth/signin", { message: "Account verified successfully. Please sign in." });
    }
}


export default new AuthController();