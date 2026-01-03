import passport from "passport";
import LocalStrategy from "passport-local";
import authService from "../services/auth.service.js";
import userService from "../services/user.service.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import config from "./config.js";

passport.use(new FacebookStrategy({
    clientID: config.facebookAppId,
    clientSecret: config.facebookAppSecret,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
},
    async function (accessToken, refreshToken, profile, done) {
        const _data = {};
        _data.username = profile.displayName;
        _data.facebook_id = profile.id;
        const { status, message, data } = await authService.signInWithFaceBook(_data);
        if (status == 0) {
            return done(null, data);
        }
        return done(null, false, { status: 1, message: "error" });
    }
));

passport.use(new GoogleStrategy({
    clientID: config.googleClientId,
    clientSecret: config.googleClientSecret,
    callbackURL: "http://localhost:3000/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, done) {
        const _data = {};
        _data.username = profile.name.familyName + " " + profile.name.givenName;
        _data.email = profile.emails[0].value;
        _data.google_id = profile.id;
        const { status, message, data } = await authService.signInWithGoogle(_data);

        if (status == 0) {
            return done(null, data);
        }
        return done(null, false, { status: 1, message: message });
    }
));


passport.use(new LocalStrategy(async function (username, password, done) {
    try {
        const { status, message, data } = await authService.signInWithEmail({ signInField: username, password: password });
        if (status === 0) {
            return done(null, data);
        }
        else if (status === 2) {
            return done(null, data, { status, message });
        }
        else {
            return done(null, false, { status, message });
        }
    }
    catch (err) {
        return done(err);
    }
}));

passport.serializeUser(async function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id });
    });
});

passport.deserializeUser(async function (user, cb) {
    process.nextTick(async function () {
        try {
            const fullUser = await userService.getUserById(user.id);
            return cb(null, fullUser);
        } catch (err) {
            return cb(err);
        }
    });
});

export default passport;