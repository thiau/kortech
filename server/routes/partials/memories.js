(function () {
    "use strict";

    module.exports = function (app, cloudantFactory, request, obj_helper, photoHelper, upload) {
        var database = cloudantFactory("img_metadata");

        app.post('/storeMemory', upload.single('photo'), function (req, res) {

            photoHelper.getMatadata(req.file.buffer).then(function (metadata) {
                request({
                    "method": 'POST',
                    "url": 'http://9.45.201.45:8080/getObjects',
                    "headers": {
                        'content-type': 'multipart/form-data'
                    },
                    "formData": {
                        "imagefile": {
                            "value": req.file.buffer,
                            "options": {
                                "filename": 'image-tensorflow',
                                "contentType": null
                            }
                        }
                    }
                }, function (error, response, body) {
                    if (error) {
                        console.log(error);
                    } else {

                        metadata.objects = JSON.parse(body);

                        JSON.parse(body).forEach(function (item) {

                            if(item.name === "person") {
                                metadata.person = true;
                            } else if (item.name === "laptop") {
                                metadata.laptop = true;
                            }

                        });


                        database.create(metadata).then(function (doc) {
                            obj_helper.upload(doc.id, req.file.buffer).then(function (response) {
                                res.status(200).send(response);
                            }).catch(function (err) {
                                res.status(400).send(err);
                            });
                        }).catch(function (err) {
                            res.status(400).send(err);
                        });
                    }
                });

            }).catch(function (err) {
                res.status(400).send(err);
            });

        });
    };

}());
