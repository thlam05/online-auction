import express from "express";
import passport from "../configs/passport.config.js";
import authController from "../controllers/auth.controller.js";
import { ensureAuthenticated } from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/signin", authController.getSignIn);
router.post("/signin", authController.signIn);
router.get("/signup", authController.getSignUp);
router.post('/signup', authController.signUp);
router.post('/logout', authController.logout);
router.get("/otp-verify", authController.getOtpVerify);
router.post('/otp-verify', authController.verifyOtp);
router.post('/verify-password', authController.verifyPassword);

router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

export default router;