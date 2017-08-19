
(function () {
    "use strict";

    const WatsonConversation = require("watson-developer-cloud/conversation/v1");
    const watsonConfigs = require("../configs/wcsConfig");
	const conversationInstance = new WatsonConversation(watsonConfigs);

    module.exports = function () {
        return {
            "sendMessage": function (options) {
                return new Promise(function (resolve, reject) {
                    if (!options) {
                        return reject("Can not proceed without options object");
                    }

                    if (!options.workspace_id) {
                        options.workspace_id = watsonConfigs.workspace_id;
                    }

                    conversationInstance.message(options, function (err, response) {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        } else {
                            return resolve(response);
                        }
                    });
                });
            }
        };
    };

}());