/**
 * Created by danielabrao on 3/27/17.
 */
(function () {
    "use strict";

    module.exports = function () {
        var elementList = {};
        return {
            "get": function (el) {
                if (elementList[el]) {
                    return elementList[el];
                } else {
                    throw new Error("Invalid Element required: " + el);
                }
            },
            "set": function (el, val) {
                elementList[el] = val;
            },
            "clean": function () {
                elementList = {};
            }
        };
    };

}());
