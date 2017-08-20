/**
 * Created by danielabrao on 3/27/17.
 */

(function () {
    "use strict";

    const App = require("./components/app.vue");
    const Vue = require("vue");
	new Vue({
		"el": "#app",
		"render": function (h) {
			return h(App)
		}
	});

}());
