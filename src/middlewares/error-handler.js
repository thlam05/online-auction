
export function errorHandler(err, req, res, next) {
    console.log(err);

    res.status(500).render("error/500", {
        layout: "error"
    });
}

export function errorNotFoundHandler(req, res, next) {
    res.status(404).render("error/404", {
        layout: "error"
    });
}
