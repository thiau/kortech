(function () {
    "use strict";

    const bcrypt = require("bcrypt");
    let saltRounds = 6;

    module.exports = {
        "generateHash": function (password, customSaltRounds) {
            return new Promise(function (resolve, reject) {
                bcrypt.hash(password, customSaltRounds || saltRounds).then(function (hash) {
                    resolve(hash);
                }).catch(function (err) {
                    reject(err);
                });
            });
        },
        "validateHash": function (password, hash) {
            return new Promise(function (resolve, reject) {
                bcrypt.compare(password, hash).then(function (res) {
                    if (res) {
                        resolve(res);
                    } else {
                        reject(res);
                    }
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    };

}());
