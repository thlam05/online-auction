import express from "express";

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

export default router;