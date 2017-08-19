/**
 * Created by danielabrao on 05/07/17.
 */
(function () {
    "use strict";

    module.exports = function (app, passport) {
		app.get("/login", passport.authenticate("openidconnect", {}));

        app.get("/auth/sso/callback", function(req,res,next) {
            passport.authenticate("openidconnect", {
                "successRedirect": "/",
                "failureRedirect": "/failure"
            })(req, res, next);
        });

        app.get("/failure", function(req, res) {
            return res.status(500).send("login failed");
        });

        app.post("/logout", function (req, res) {
			req.session.destroy(function () {
				req.logout();
				res.redirect("/");
			});
		});
    }

}());