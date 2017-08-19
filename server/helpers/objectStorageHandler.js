(function (){
  "use strict";

  const os = require("bluemix-objectstorage").ObjectStorage;
  const os_credentials = require("../configs/objStorageConfig");

  const objectStorage = new os(os_credentials);

  module.exports = function () {
    return {
      "teste": function(){
        objectStorage.getContainer("images")
          .then(function(container){
            console.log(container);
          })
          .catch(function(err){
            console.log(err);
          })
      }
    }
  }
}());