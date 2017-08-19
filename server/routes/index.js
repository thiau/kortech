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

    module.exports = function (app, upload, text_to_speech, speech_to_text, conversation, FileHandler, fs, obj_config, obj_helper) {

      require("./partials/watsonHandler")(app, upload, text_to_speech, speech_to_text, conversation, FileHandler, fs);

        app.get("/", function (req, res) {
            return res.status(200).render("./main_module/index.html");
        });

        app.post("/test_os", function(req, res){
          obj_helper.teste();
          res.send("foi");
        });
    };


}());