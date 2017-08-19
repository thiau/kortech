/*jslint node: true, nomen:true*/
/*env:node*/
(function () {
    "use strict";
	require("dotenv").config({"silent": true});
    const gulp = require("gulp");
    const packageJson = require("./package.json");
    const swPrecache = require("sw-precache");
    const argv = require("yargs").argv;
    const browserify = require("browserify");
    const imageResize = require("gulp-image-resize");
    const cond = require("gulp-cond");
    const gutil = require("gulp-util");
	const fs = require("fs");
    const fse = require("fs-extra");
    const uglify = require("gulp-uglify");
    const imagemin = require("gulp-imagemin");
    const rename = require("gulp-rename");
    const cssnano = require("cssnano");
    const cache = require("gulp-cache");
    const postcss = require("gulp-postcss");
	const runSequence = require("run-sequence");
    const watchify = require("watchify");
    const buffer = require("vinyl-buffer");
    const source = require("vinyl-source-stream");
    const sourcemaps = require("gulp-sourcemaps");
    const babelify = require("babelify");
    const envify = require("gulp-envify");
    const vueify = require("vueify");
    const eslint = require("gulp-eslint");
    const plumber = require("gulp-plumber");
    const path = require("path");
    const cssnext = require("postcss-cssnext");
    const fetch = require("node-fetch");
    const cssUglifier = [
            cssnano()
        ];
	const childProcess = require("child_process");
	const WEBHOOK_ENDPOINT = process.env.WEBHOOK_ENDPOINT || argv.slack;
    let currentContext = "";
    let browserifyInstance;
    let modulePath;
    let isProd;
    let isBluemix = argv.bluemix || argv.bx;

	process.env.NODE_ENV = argv.prod ? "production" : "development";
    isProd = process.env.NODE_ENV === "production";
    let methods = {
    	"sendSlackMessage": function (payload) {
    		return new Promise(function (resolve, reject) {
				if (WEBHOOK_ENDPOINT) {
					fetch(WEBHOOK_ENDPOINT, {
						"method": "POST",
						"body": JSON.stringify(payload),
						"headers": {
							"Content-Type": "application/json"
						},
					}).then(response => resolve(response))
						.catch(error => reject(error));
				} else {
					reject("Webhook ID not available");
				}
			});
		},
    	"errorHandler": function (module, error, stack) {
			gutil.log(gutil.colors.red("ERROR FOUND BUILDING THIS ARTIFACT:"), gutil.colors.yellow(module));
			gutil.log(error);
			gutil.log(stack);
			if (isBluemix) {
				let log_url;
				if (isProd) {
					log_url = "https://console.bluemix.net/devops/pipelines/c4ecd55d-094b-4dc1-b0bd-34b18843914f?env_id=ibm:yp:us-south";
				} else {
					log_url = "https://console.bluemix.net/devops/pipelines/6fe4f57b-6c3b-44d7-9c4c-b99ccafb37a1?env_id=ibm:yp:us-south";
				}
				methods.sendSlackMessage({
					"username": "BUILD FAILING",
					"icon_emoji": ":interrobang:",
					"text": [
						"*ENVIRONMENT*: ", process.env.NODE_ENV, "\n",
						error, "\n",
						"Check the <", log_url, "|logs>"
					].join("")
				}).then(function () {
					gutil.log("Webhook sent");
					return process.exit(1);
				}).catch(function(error) {
					gutil.log(error);
					return process.exit(1);
				});
			} else {
				return process.exit(1);
			}
		},
    	"bundleJS": function () {
			if (isProd) {
				fse.remove(path.join(modulePath, "dist/js/bundle.js.map"));
			}
			browserifyInstance.bundle()
				.on("error", gutil.log.bind(gutil, "Browserify Error"))
				.pipe(source(path.join(modulePath, "js/main.js")))
				.pipe(cond(!isProd, plumber()))
				.pipe(buffer())
				.pipe(rename("bundle.js"))
				.pipe(cond(isProd, uglify()))
				.pipe(cond(!isProd, sourcemaps.init({loadMaps: true})))
				.pipe(cond(!isProd, sourcemaps.write("./")))
				.pipe(gulp.dest(path.join(modulePath, "dist/js/")));
			return isProd ? gutil.log("FINISHED PRODUCTION BUILD") : gutil.log("FINISHED DEV BUILD");
		},
		"createFiles": function (files) {
			return files.map(function (file) {
				return new Promise(function (resolve, reject) {
					fse.outputFile(file.path, file.content || "", "utf-8", function (err) {
						if (err) {
							reject(err);
						} else {
							resolve("file saved");
						}
					});
				})

			});
		},
		"setCFManifest": function () {
			return fse.copy(path.join("root", isProd ? "manifest.prod.yml" : "manifest.dev.yml"), "manifest.yml", {
				"overwrite": true
			});
		},
		"htmlTemplate": function (module, title) {
			return [
				"<!DOCTYPE html>",
				`<html lang="en">`,
				"<head>",
				`	<meta charset="UTF-8">`,
				`	<meta name="viewport" content="width=device-width, initial-scale=1">`,
				`	<link rel="manifest" href="./etc/manifest.json">`,
				`	<title>${title || module}</title>`,
				`	<link rel="stylesheet" href="./${module}_module/dist/css/style.css">`,
				"</head>",
				"<body>",
				`	<div id="app"></div>`,
				`	<script src="./${module}_module/dist/js/bundle.js"></script>`,
				"</body>",
				"</html>"].join("\n");
		},
		"jsTemplate": function () {
			return [
				"(function () {",
				`	"use strict";`,
				"}());"
			].join("\n");
		}
	};

	gulp.task("build-all", ["lint:server", "set-manifest"], function () {
		fs.readdir("./client", function (err, files) {
			files.forEach(function (file) {
				let stat = fs.statSync(path.join("client"));
				if (stat.isDirectory() && file.indexOf("_module") > -1) {
					let module = file.split("_")[0];
					childProcess.exec(["gulp build -m", module, isProd ? "--prod" : ""].join(" "), function (error, stdout) {
						gutil.log([gutil.colors.blue("MODULE:"), module, gutil.colors.blue("BUILD TYPE:"), process.env.NODE_ENV].join(" "));
						if (error) {
							methods.errorHandler(module, error, stdout);
						} else {
							gutil.log(stdout);
							gutil.log(gutil.colors.green("Module built successfully"));
						}
					});
				}
			});
		});
	});

	gulp.task("build", function () {
		runSequence("lint", "js", "css", "generate-sw");
	});

	gulp.task("js", function () {
        modulePath = currentContext ? currentContext : path.join("client", (argv.module || argv.m || currentContext || "main") + "_module");
        browserifyInstance = browserify({
            "entries": path.join(modulePath, "js/main.js"),
            "noParse": ["vue.js"],
            "plugin": argv.w || argv.watch ? [watchify] : [],
            "cache": {},
            "packageCache": {},
            "debug": true
        }).transform("envify", {
            "global": true,
            "NODE_ENV": process.env.NODE_ENV
        })
        .transform(babelify)
        .transform(vueify)
        .on("update", methods.bundleJS);
        return methods.bundleJS();
    });

    gulp.task("css", function () {
        modulePath = currentContext ? currentContext : path.join("client", (argv.module || argv.m || currentContext || "main") + "_module");
        return gulp.src([path.join(modulePath, "/css/*.css")])
            .pipe(plumber())
            .pipe(postcss([
                cssnext({})
            ]))
            .pipe(cond(isProd, postcss(cssUglifier)))
            .pipe(gulp.dest(path.join(modulePath, "/dist/css/")));
    });

    gulp.task("lint", function () {
        modulePath = currentContext ? currentContext : path.join("client", (argv.module || argv.m || currentContext || "main") + "_module");
        return gulp.src([[modulePath, "/js/**/*.js"].join(""), [modulePath, "/js/**/*.vue"].join("")])
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failAfterError());
    });

    gulp.task("lint:server", function () {
        return gulp.src(["./app.js", "./server/**/*.js"])
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failAfterError())
			.on("error", function (error) {
				methods.errorHandler("lint:server", error, "Check the logs to see where it fails");
			});
    });

    gulp.task("watch", function() {
        let modulePath = path.join("./client/", (argv.module || argv.m || currentContext || "main") + "_module");
        currentContext = modulePath;
        gulp.watch([modulePath + "/js/**/*.js", modulePath + "/js/*.js", modulePath + "/css/**/*.css", modulePath + "/js/components/*.vue"], ["build"]);
    });

    gulp.task("images", function () {
        return gulp.src("public/images/disclaimer/*.+(png|jpg|jpeg|gif|svg)").pipe(cache(imagemin())).pipe(gulp.dest("public/images/disclaimer/dist"));
    });

    gulp.task("generate-sw", function(callback) {
		swPrecache.write(path.join("./client", "service-worker.js"), {
			"cacheId": packageJson.name,
			"logger": gutil.log,
			"handleFetch": isBluemix,
			"staticFileGlobs": [
				"./client/**/dist/css/style.css",
				"./client/**/dist/js/bundle.js",
				"./client/etc/service-worker-registration.js",
				"./client/etc/manifest.json",
				"./client/service-worker.js",
				'./client/etc/error.html'
			],
			"stripPrefix": "./client",
			// "runtimeCaching": [{
			// 	"urlPattern": "/",
			// 	"handler": "fastest"
			// }]
		}, callback);
    });


	gulp.task("set-manifest", function (done) {
		methods.setCFManifest().then(function () {
			done();
		}).catch(function (error) {
			methods.errorHandler("set-manifest", error, "Check the logs to see where it fails");
		});
	});

	gulp.task("notifyBuildSuccess", function () {
		methods.sendSlackMessage({
			"username": "BUILD SUCCESS",
			"text": "ENVIRONMENT: *" + process.env.NODE_ENV + "* finished building and preparing to deploy",
			"icon_emoji": ":cat2:"
		})
	});

	gulp.task("create-module", function () {
		let module = argv.m || argv.module;
		let override = argv.o || argv.override;
		if (!module) {
			gutil.log("can not proceed without module parameter");
		} else {
			let targetPath = path.join("./client", module + "_module/");
			let cssPath = path.join(targetPath, "css");
			let jsPath = path.join(targetPath, "js");

			if (fse.pathExistsSync(targetPath) && !override) {
				gutil.log("Module already exists. Run with -o flag to override");
			} else {
				Promise.all(methods.createFiles([{
					"path": path.join(targetPath, "index.html"),
					"content": methods.htmlTemplate(module)
				}, {
					"path": path.join(cssPath, "style.css"),
					"content": ""
				}, {
					"path": path.join(jsPath, "main.js"),
					"content": methods.jsTemplate()
				}])).then(function (result) {
					gutil.log(result);
				}).catch(function (err) {
					gutil.log(err);
				});
			}
		}
	});

	gulp.task("help", function () {
		/*
		params to doc
			@ watch, alias w -> #build
			@ prod -> #env
			@ bluemix, alias bx -> #generate-sw
			@ module, alias m -> #build
			@ override, alias o -> #create-module
		 */

		gutil.log(gutil.colors.green("Task: build-all"), gutil.colors.magenta('#'));
		gutil.log(gutil.colors.green("Task: build"), gutil.colors.magenta('#'));
		gutil.log(gutil.colors.green("Task: lint"), gutil.colors.magenta('#'));
		gutil.log(gutil.colors.green("Task: lint:server"), gutil.colors.magenta('#'));
		gutil.log(gutil.colors.green("Task: js"), gutil.colors.magenta('#'));
		gutil.log(gutil.colors.green("Task: css"), gutil.colors.magenta('#'));
		gutil.log(gutil.colors.green("Task: generate-sw"), gutil.colors.magenta('#'));
		gutil.log(gutil.colors.green("Task: set-manifest"), gutil.colors.magenta('#'));
		gutil.log(gutil.colors.green("Task: create-module"), gutil.colors.magenta('#'));
		gutil.log(gutil.colors.green("Task: images"), gutil.colors.magenta('#'));
	});

	process.on("exit", function(code) {
		gutil.log("About to exit with code:", code);
	});

}());