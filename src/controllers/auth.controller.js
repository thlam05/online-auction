import passport from "../configs/passport.config.js";
import authService from "../services/auth.service.js";
import { sendOtpEmail } from "../utils/nodemailer.js";
import bcrypt from "bcrypt";
import pendingUserModel from "../models/pending-user.model.js";

class AuthController {
    //  GET - /auth/login
    getSignIn(req, res, next) {
        try {
            res.render("auth/signin");
        } catch (err) {
            next(err);
        }
    }

    // GET - /auth/signup
    getSignUp(req, res, next) {
        try {
            res.render("auth/signup");
        } catch (err) {
            next(err);
        }
    }

    // GET - /auth/otp-verify
    async getOtpVerify(req, res, next) {
        try {
            const { email, pendingUserId } = req.query;
            const pendingUser = await pendingUserModel.findById(pendingUserId);
            res.render("auth/otp-verify", { email, pendingUserId, message: pendingUser.message, redirectTo: pendingUser.redirect_to });
        } catch (err) {
            next(err);
        }
    }

    // POST - /auth/signin
    signIn(req, res, next) {
        try {
            return passport.authenticate('local', async (err, user, info) => {
                if (err) { return next(err); }
                if (info && info.status == 1) {
                    return res.render("auth/signin", { data: req.body, message: info.message, error: true });
                }
                else if (info && info.status == 2) {
                    const { status, message, data } = await authService.savePendingUser(user, "Your account has not been verified by OTP, please enter the OTP code to log in");
                    return res.redirect(`/auth/otp-verify?email=${data.email}&pendingUserId=${data.id}`);
                }
                req.logIn(user, (err) => {
                    if (err) return next(err);
                    const redirectTo = req.session.passport.redirectTo || '/';
                    delete req.session.redirectTo;
                    return res.redirect(redirectTo);
                });
            })(req, res, next);
        } catch (err) {
            next(err);
        }
    }

    // POST - /auth/logout
    logout(req, res, next) {
        try {
            req.logout(function (err) {
                if (err) { return next(err); }
                res.redirect('/');
            });
        } catch (err) {
            next(err);
        }
    }

    // POST - /auth/signup
    async signUp(req, res, next) {
        try {
            const { username, email, address, birthday, password } = req.body;
            const data = { username, email, address, birthday, password };

            const result = await authService.signUpWithEmail(data);
            if (result.status == 1) {
                res.render("auth/signup", { data: req.body, message: result.message, error: true });
            }
            else {
                const { email, id } = result.data;
                res.redirect(`/auth/otp-verify?email=${email}&pendingUserId=${id}`);
            }
        } catch (err) {
            next(err);
        }
    }

    // POST - /auth/otp-verify
    async verifyOtp(req, res, next) {
        try {
            const { otp, pendingUserId, email, redirectTo } = req.body;
            const pendingUser = await pendingUserModel.findById(pendingUserId) || await pendingUserModel.findByEmail(email);
            if (pendingUser == undefined) {
                return res.render("/auth/otp-verify", { email: req.body.email, pendingUserId, message: pendingUser.message, errorMessage: "Invalid pending user. Please sign up again.", error: true, redirectTo: pendingUser.redirect_to });
            }
            if (pendingUser.expired_at < new Date(Date.now())) {
                return res.render("auth/otp-verify", { email: req.body.email, pendingUserId, message: pendingUser.message, errorMessage: "OTP has expired. Please resend code again.", error: true, redirectTo: pendingUser.redirect_to });
            }
            if (pendingUser.otp != otp) {
                return res.render("auth/otp-verify", { email: req.body.email, pendingUserId, message: pendingUser.message, errorMessage: "Incorrect OTP. Please try again.", error: true, redirectTo: pendingUser.redirect_to });
            }
            if (otp == pendingUser.otp) {
                const result = await authService.verifyUser(pendingUser);
                if (result.status == 0) {
                    res.redirect(redirectTo);
                }
            }
        } catch (err) {
            next(err);
        }
    }

    // POST - /auth/verify-password
    async verifyPassword(req, res, next) {
        try {
            const { password } = req.body;
            const user = req.session.passport.user;
            if (user && bcrypt.compareSync(password, user.password)) {
                return res.json({ valid: true });
            }
            return res.json({ valid: false });
        } catch (err) {
            next(err);
        }
    }

    async getEmailRecoveryPassword(req, res, next) {
        try {
            res.render("auth/get-email");
        } catch (err) {
            next(err);
        }
    }

    async checkEmailRecoveryPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await authService.checkExistEmail(email);
            if (result.status == 1) {
                return res.render("auth/get-email", { errorMessage: result.message, error: true });
            }
            return res.redirect(`/auth/otp-verify?email=${result.data.email}&pendingUserId=${result.data.id}`);
        } catch (err) {
            next(err);
        }
    }

    async getRecoveryPassword(req, res, next) {
        try {
            const { userId } = req.query;
            res.render("auth/recovery-password", { userId });
        } catch (err) {
            next(err);
        }
    }

    async recoveryPassword(req, res, next) {
        try {
            const { password, userId } = req.body;
            const result = await authService.recoveryPassword(userId, password);
            if (result.status == 0) return res.redirect("/auth/signin");
            return res.json(result);
        } catch (err) {
            next(err);
        }
    }
}


export default new AuthController();