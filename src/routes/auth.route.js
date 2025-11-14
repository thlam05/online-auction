import express from "express";
import passport from "../configs/passport.config.js";
import authController from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/signin", authController.showSignIn);

router.get("/signup", authController.showSignUp);

router.get("/otp-verify", authController.showOtpVerify);

// router.get("/google", passport.authenticate("google", {
//     scope: ["profile", "email"]
// }))

// router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }),
//     (req, res) => {
//         res.redirect("/");
//     }
// )

router.post("/signin", passport.authenticate("local", {
    successRedirect: '/',
    failureRedirect: '/auth/signin'
}))

export default router;