
export function authenticate(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.authUser = req.user;
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

export function isSeller(req, res, next) {
    if (!req.isAuthenticated() || !req.user || req.user.permission != 1) {
        req.session.redirectTo = req.originalUrl;
        return res.redirect('/');
    }
    next();
}

export function isAdmin(req, res, next) {
    if (!req.isAuthenticated() || !req.user || req.user.permission !== 2) {
        req.session.redirectTo = req.originalUrl;
        return res.redirect('/');
    }
    next();
}
