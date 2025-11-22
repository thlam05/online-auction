import passport from "passport";
import LocalStrategy from "passport-local";
import authService from "../services/auth.service.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "./config.js";


passport.use(new GoogleStrategy({
    clientID: config.googleClientId,
    clientSecret: config.googleClientSecret,
    callbackURL: "http://localhost:3000/auth/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        console.log("Google profile:", profile);
        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //     return cb(err, user);
        // });
    }
));


passport.use(new LocalStrategy(async function (username, password, done) {
    try {
        const result = await authService.signInWithEmail({ signInField: username, password: password });
        if (result.status === 0) {
            return done(null, result.data);
        }
        else if (result.status === 3) {
            return done(null, false, result);
        }
        else {
            return done(null, false, result);
        }
    }
    catch (err) {
        return done(err);
    }
}));

passport.serializeUser(async function (user, cb) {
    process.nextTick(function () {
        cb(null, user);
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

export default passport;