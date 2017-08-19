(function () {
	"use strict";

	module.exports = function (app, mqttClient) {
		app.post("/createDevice", function (req, res) {
			if (!req.body.deviceId) {
				return res.status(403).send("Can not operate without a deviceId");
			}
			mqttClient.createDevice(req.body.deviceId).then((result) => {
				return res.status(200).send(result);
			}).catch((err) => {
				return res.status(500).send(err);
			});
		});

		app.delete("/deleteDevice", function (req, res) {
			if (!req.body.deviceId) {
				return res.status(403).send("Can not operate without a deviceId");
			}
			mqttClient.deleteDevice(req.body.deviceId).then((result) => {
				return res.status(200).send(result);
			}).catch((err) => {
				return res.status(500).send(err);
			});
		});

		app.get("/listDevices", function (req, res) {
			mqttClient.listDevices().then((result) => {
				return res.status(200).send(result);
			}).catch((err) => {
				return res.status(500).send(err);
			});
		});
	};
}());