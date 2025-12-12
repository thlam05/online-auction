
export function authenticate(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.authUser = req.session.passport.user;
    }
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
}

export function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        req.session.redirectTo = req.originalUrl;

        return res.redirect('/auth/signin');
    }
}