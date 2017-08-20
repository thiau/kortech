/**
 * Created by danielabrao on 02/07/17.
 */
(function () {
    "use strict";

    let ensureAuthenticated = function (req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            req.session.originalUrl = req.originalUrl;
            res.redirect("/login");
        }
    };

    module.exports = function (app, upload, watsonConversation, FileHandler, fs, obj_helper, cloudantFactory, request, photoHelper) {
        require("./partials/watsonHandler")(app, upload, FileHandler, fs, cloudantFactory, watsonConversation, obj_helper);
        require("./partials/memories")(app, cloudantFactory, request, obj_helper, photoHelper, upload);
        app.get("/", function (req, res) {
            return res.status(200).render("./main_module/index.html");
        });

        app.post("/test_os", function (req, res) {
            obj_helper().teste("foto.jpg");
            res.send("foi");

        });
    };


}());
