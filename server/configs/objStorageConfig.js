(function (process) {
  "use strict";

  const ObjectStorage = require('bluemix-objectstorage').ObjectStorage;

  module.exports = {
    "projectId": process.env.OBJSTORAGE_PROJECT_ID,
    "userId": process.env.OBJSTORAGE_USER_ID,
    "password": process.env.OBJSTORAGE_PASSWORD,
    "region":  ObjectStorage.Region.DALLAS
  }

}(process));