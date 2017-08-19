(function (){
  "use strict";

  const vr = require("watson-developer-cloud/visual-recognition/v3");
  const vr_config = require("../configs/vrsConfig");

  let visual_recognition = vr(vr_config);

  module.exports = function(){
    return {
      "classify": function(imageUrl){
        return new Promise((reject, resolve) => {
          visual_recognition.classify(imageUrl, function(err, res){
            if (err){
              reject(err);
            }
            console.log(res);
            resolve(res);
          });
        });
      }
    }
  }

}());