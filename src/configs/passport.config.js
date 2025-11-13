import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import LocalStrategy from "passport-local";
import config from "./config.js";
import authService from "../services/auth.service.js";

passport.use(new GoogleStrategy({
    clientID: config.googleClientId,
    clientSecret: config.googleClientSecret,
    callbackURL: "/auth/google/callback"
}, function (accessToken, refreshToken, profile, cb) {
    console.log(profile);
}))

// passport-local
passport.use(new LocalStrategy(
    async function verify(username, password, cb) {
        const res = await authService.signInWithEmail({ signInField: username, password: password });
        if (res.status === 0) {
            return cb(null, res.data);
        }
        else {
            return cb(null, false, { message: res.message });
        }
    }
));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

export default passport;