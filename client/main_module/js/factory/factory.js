/**
 * Created by danielabrao on 3/27/17.
 */
(function () {
    "use strict";

    module.exports = {
		"askWatson": function (question) {
			return new Promise(function (resolve, reject) {
				if (!question) {
					return reject("Can not proceed without credentials");
				}

				if (window.XMLHttpRequest) {
					let xhttp = new window.XMLHttpRequest();
					xhttp.onreadystatechange = function() {
						if (xhttp.readyState === 4) {
							if (xhttp.status === 200 || xhttp.status === 201) {
								if (xhttp.responseText) {
									try {
										resolve(JSON.parse(xhttp.responseText));
									} catch (e) {
										resolve(xhttp.responseText);
									}
								} else {
									reject("An error occurred: Empty response");
								}

							} else {
								reject(["An error occurred:", xhttp.responseText].join());
							}
						}
					};

					xhttp.open("POST", "/query");
					xhttp.setRequestHeader("content-type", "application/json");
					xhttp.send(JSON.stringify({
						"question": question
					}));

				} else {
					reject("AJAX Calls not supported on this browser");
				}
			});
		}
    };

}());