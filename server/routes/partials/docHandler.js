/**
 * Created by danielabrao on 1/31/17.
 */
(function () {
    "use strict";


    const apiDocs = require("../../model/swagger/api.script");

    module.exports = function (app) {
        app.get("/api-docs", function (req, res) {
            return res.status(200).json(apiDocs);
        });

        app.get("/doc", function (req, res) {
            return res.status(200).render("./etc/swagger/dist/index.html", null);
        });
    };

}());