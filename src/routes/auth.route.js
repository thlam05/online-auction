import express from "express";
import passport from "../configs/passport.config.js";

const router = express.Router();

router.get("/signin", (req, res, next) => {
    res.render("auth/signin");
})

router.get("/signup", (req, res, next) => {
    res.render("auth/signup");
})

router.get("/otp-verify", (req, res, next) => {
    res.render("auth/otpVerify");
})

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