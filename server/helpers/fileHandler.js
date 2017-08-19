/**
 * Created by danielabrao on 3/20/17.
 */
(function () {
    "use strict";

    const fs = require("fs");
	const basePath = "./server/temp/audio/";

    module.exports = function () {
        return {
            "saveFile": function (fileName, file) {
                return new Promise(function (resolve, reject) {
                    let filePath = [basePath, fileName, "-", new Date().getTime().toString().slice(5, -2), ".wav"].join("");
                    fs.writeFile(filePath, file.buffer, function (err) {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(filePath);
                    });
                });
            },
            "deleteFile": function (filePath) {
                return new Promise(function (resolve, reject) {
                    fs.unlink(filePath, function (err, data) {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(data);
                    });
                });
            }
        };
    };

}());