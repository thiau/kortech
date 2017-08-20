/**
 * Created by danielabrao on 6/9/17.
 */
(function () {
    "use strict";
    const appEnv = require("cfenv").getAppEnv();
    process.isLocal = /localhost/.test(appEnv.bind) || appEnv.isLocal;
    require("dotenv").config({
        "silent": true
    });
    const appPort = process.env.APP_PORT || process.env.VCAP_APP_PORT || 6012;
    const express = require("express");
    const request = require("request");
    const cloudantFactory = require("./server/helpers/cloudant");
    const app = express();
    const fs = require("fs");
    const server = require("http").createServer(app);
    const cookieSession = require("cookie-session");
    const cookieParser = require("cookie-parser");
    const passport = require("passport");
    const compress = require("compression");
    const engines = require("consolidate");
    const morgan = require("morgan");
    const bodyParser = require("body-parser");
    const FileHandler = require("./server/helpers/fileHandler")();
    const stthelpers = require("./server/helpers/audioConverter")();
    const ttshelpers = require("./server/helpers/textConverter")();
    const wcshelpers = require("./server/helpers/conversation")();
    const ExifImage = require('exif').ExifImage;
    const photoHelper = require("./server/helpers/photoProcesser")(ExifImage, cloudantFactory);
    const multer = require("multer");
    const obj_helper = require("./server/helpers/objectStorageHandler")();

    const upload = multer({
        "fileFilter": function (req, file, cb) {
            try {
                let splittedName = file.originalname.split(".");
                file.dataType = splittedName[splittedName.length - 1];
            } catch (e) {
                console.log(e);
            }

            return cb(null, true);
        }
    });

    app.disable("x-powered-by");
    app.use(compress());
    app.use(cookieParser());
    app.use(cookieSession({
        "secret": process.env.APP_SECRET,
        "maxAge": 86400000,
        "saveUninitialized": false,
        "resave": false,
        "name": "K0rt&ch",
        "cookie": {
            "secure": true,
            "httpOnly": true
        }
    }));

    if (process.isLocal) {
        app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));
    }

    app.use(passport.initialize());
    app.use(passport.session());
    app.engine("html", engines.ejs);
    app.set("view engine", "ejs");
    app.set("views", __dirname + "/client");
    app.use(express.static(__dirname + "/client"));
    app.use(bodyParser.json({
        "limit": "50mb"
    }));
    app.use(bodyParser.urlencoded({
        "extended": true,
        "limit": "10mb"
    }));

    require("./server/helpers/passport")(passport);
    require("./server/routes/index")(app, upload, ttshelpers, stthelpers, wcshelpers, FileHandler, fs, obj_helper, cloudantFactory, request, photoHelper);


    //Batch processer
	// 
    // var database = cloudantFactory("img_metadata");
    // fs.readdir("/Users/thirauj/Documents/Thiago/IBM/temp/storage", function (err, files) {
    //     files.forEach(function (file) {
    //         fs.readFile("/Users/thirauj/Documents/Thiago/IBM/temp/storage/" + file, function (err, content) {
	// 			photoHelper.getMatadata(content).then(function (metadata) {
	// 				request({
	// 					"method": 'POST',
	// 					"url": 'http://9.45.201.45:8080/getObjects',
	// 					"headers": {
	// 						'content-type': 'multipart/form-data'
	// 					},
	// 					"formData": {
	// 						"imagefile": {
	// 							"value": content,
	// 							"options": {
	// 								"filename": 'image-tensorflow',
	// 								"contentType": null
	// 							}
	// 						}
	// 					}
	// 				}, function (error, response, body) {
	// 					if (error) {
	// 						console.log(error);
	// 					} else {
	//
	// 						metadata.objects = JSON.parse(body);
	//
	// 						JSON.parse(body).forEach(function (item) {
	//
	// 							if(item.name === "person") {
	// 								metadata.person = true;
	// 							} else if (item.name === "laptop") {
	// 								metadata.laptop = true;
	// 							}
	//
	// 						});
	//
	//
	// 						database.create(metadata).then(function (doc) {
	// 							obj_helper.upload(doc.id, content).then(function (response) {
	// 								console.log(response);
	// 							}).catch(function (err) {
	// 								console.log(err);
	// 							});
	// 						}).catch(function (err) {
	// 							console.log(err);
	// 						});
	// 					}
	// 				});
	//
	// 			}).catch(function (err) {
	// 				console.log(err);
	// 			});
    //         })
    //     })
    // });

    server.listen(appPort, function () {
        process.stdout.write(`\nServer running on port: ${appPort}\n`);
    });

}());
