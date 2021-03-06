(function () {
	"use strict";


	module.exports = function (app, upload, FileHandler, fs, cloudantFactory, watsonConversation, obj_helper) {
		let imageDB = cloudantFactory("img_metadata");
		let transformDate = require("../../helpers/dateRange").transformDate;


		app.get("/getImageById", function (req, res) {
			if (!req.query.id) {
				return res.status(500).send("Can not proceed without ID");
			}
			obj_helper.get(req.query.id).then(function (imageData) {
				return res.status(200).send(imageData);
			}, function (err) {
				return res.status(500).send(err);
			});
		});

		app.post("/query", function (req, res) {
			if (!req.query.question && !req.body.question) {
				return res.status(403).send("Can not proceed without question property");
			}
			watsonConversation.sendMessage({
				"input": {
					"text": req.body.question
				},
				"context": {}
			}).then(function (data) {

				console.log(data.context);

				let startDate = data.context.date_init;
				let endDate = data.context.date_end || data.context.date_init;
				let startHour = data.context.time_init;
				let endHour = data.context.time_end;

				let startDateFinal = new Date([startDate, startHour].join(" "));
				let endDateFinal = new Date([endDate, endHour].join(" "));

				let converted = transformDate(startDateFinal, endDateFinal, true);

				if ((startDate === endDate) && (startHour === endHour)) {
					converted.end += 900000;
				}
				console.log(converted);

				imageDB.get({
					"selector": {
						"person": data.context.person,
						"laptop": data.context.laptop,
						"$and": [{
							"timestamp": {
								"$gte": converted.start
							}
						}, {
							"timestamp": {
								"$lte": converted.end
							}
						}]
					},
					"sort": [{
						"timestamp": "asc"
					}]
				}).then(function (docs) {
					console.log(docs);

					if(data.context.laptop) {
						return res.status(200).send({
							"docs": [
								docs.docs[0],
								docs.docs[1],
								docs.docs[2]
							]
						});
					} else {
						return res.status(200).send(docs);
					}
				}).catch(function (err) {
					return res.status(500).send(err);
				});
			}, function (err) {
				console.log(err);
				return res.status(500).send(err);
			});
		});

		app.get("/downloadAudio", function (req, res) {
			if (!req.query.filePath || !req.query.fileName) {
				return res.status(500).send("Can not proceed without file name and path");
			}
			//
			setTimeout(function () {
				try {
					fs.unlinkSync(req.query.filePath);
				} catch (e) {
					console.log(e);
				}
			}, 3000);
			res.setHeader("content-Type", "audio/wav");
			res.setHeader("Content-Disposition", ["attachment;filename=/", req.query.fileName + ".wav"].join(""));
			return res.download(req.query.filePath);
		});

	};

}());
