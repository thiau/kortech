/**
 * Created by danielabrao on 3/27/17.
 */
(function (window) {
    "use strict";

    const controller = require("./controller/controller");
    const App = require("./components/app.vue");
    const Vue = require("vue");
	new Vue({
		"el": "#app",
		"render": function (h) {
			return h(App)
		}
	});
    window.init = controller.init;

}(window));
