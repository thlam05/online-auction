

class AuthController {
    //  GET - /auth/login
    showSignIn(req, res, next) {
        res.render("auth/signin");
    }

    // GET - /auth/signup
    showSignUp(req, res, next) {
        res.render("auth/signup");
    }

    // GET - /auth/otp-verify
    showOtpVerify(req, res, next) {
        res.render("auth/otpVerify");
    }
}


export default new AuthController();