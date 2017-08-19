/**
 * Created by danielabrao on 3/20/17.
 */
(function () {
    "use strict";

    const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
	const ttsCredentials = require("../configs/ttsConfig");
	const fs = require("fs");
    const text_to_speech = new TextToSpeechV1(ttsCredentials);

    module.exports = function () {
        return {
            "convertTextToAudio": function (options) {
                return new Promise(function (resolve, reject) {
                    options = options || {};
                    if (!options.fileName || !options.textMessage) {
                        return reject("Missing properties");
                    }

                    let filePath = ['./server/temp/converted/', options.fileName, "-", new Date().getTime().toString().slice(5, -2), ".wav"].join("");
                    text_to_speech.synthesize({
                        "text": ["<speak>", options.textMessage, "</speak>"].join(""),
                        "accept": "audio/wav",
                        "voice": "pt-BR_IsabelaVoice"
                    }).pipe(fs.createWriteStream(filePath).on('finish', function () {
                        resolve({
                            "filePath": filePath,
                            "fileName": options.fileName
                        });
                    }));
                });
            }
        };
    };
}());