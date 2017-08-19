/**
 * Created by danielabrao on 1/21/17.
 */
/*jslint node:true*/
(function () {
    "use strict";
    const Cloudant = require("cloudant");
	const credentials = {
            "username": process.env.CLOUDANT_USER || JSON.parse(process.env.VCAP_SERVICES)["cloudantNoSQLDB"][0].credentials.username,
            "password": process.env.CLOUDANT_PASS || JSON.parse(process.env.VCAP_SERVICES)["cloudantNoSQLDB"][0].credentials.password,
        };

    module.exports = {
        "init": new Cloudant({
            "account": credentials.username,
            "password": credentials.password
        }, function (err) {
            if (err) {
                console.log("error connecting to DB " + err);
            } else {
                console.log("connection success");
            }
        }),
        exportedCredentials: new Buffer([credentials.username, credentials.password].join(":")).toString("base64")
    };
}());
