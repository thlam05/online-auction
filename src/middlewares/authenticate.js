
export function authenticate(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.authUser = req.session.passport.user;
    }
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
}