import express from "express";
import passport from "../configs/passport.config.js";
import authController from "../controllers/auth.controller.js";
import { ensureAuthenticated } from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/signin", authController.getSignIn);
router.post("/signin", authController.signIn);
router.get("/signup", authController.getSignUp);
router.post("/signup", authController.signUp);
router.post("/check-email", authController.checkEmailExists);
router.post("/logout", authController.logout);
router.get("/otp-verify", authController.getOtpVerify);
router.post("/otp-verify", authController.verifyOtp);
router.post("/verify-password", authController.verifyPassword);
router.get("/recovery-password/get-email", authController.getEmailRecoveryPassword);
router.post("/recovery-password/get-email", authController.checkEmailRecoveryPassword);
router.get("/recovery-password", authController.getRecoveryPassword);
router.post("/recovery-password", authController.recoveryPassword);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/signin" }),
    function (req, res) {
        const redirectTo = req.session.redirectTo || '/';
        delete req.session.redirectTo;
        return res.redirect(redirectTo);
    });

router.get("/facebook",
    passport.authenticate("facebook"));

router.get("/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/auth/signin" }),
    function (req, res) {
        const redirectTo = req.session.redirectTo || '/';
        delete req.session.redirectTo;
        return res.redirect(redirectTo);
    });

export default router;