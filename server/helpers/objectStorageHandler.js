(function () {
  "use strict";

  const os = require("bluemix-objectstorage").ObjectStorage;
  const os_credentials = require("../configs/objStorageConfig");

  const objectStorage = new os(os_credentials);

  module.exports = function () {
    return {
      "get": function (imageName) {
        objectStorage.getContainer("images")
          .then(function (container) {
            container.getObject(imageName).then(function (obj) {
              obj.load(false)
                .then(function (content) {
                  console.log(Buffer.from(content));
                })
            });
          })
          .catch(function (err) {
            console.log(err);
          })
      },
      "upload": function (name, data) {
        return new Promise(function (resolve, reject) {
          objectStorage.getContainer("images").then(function (container) {
            container.createObject(name, data).then(function (response) {
              resolve({
                "message": "uploaded successfully"
              })
            }).catch(function (err) {
              reject({
                "message": "error on upload",
                "log": err
              })
            })
          }).catch(function (err) {
            reject({
              "message": "error on get container",
              "log": err
            })
          })
        })
      }
    }
  }
}());
