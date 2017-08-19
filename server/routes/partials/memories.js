(function () {
    "use strict";


    module.exports = function (app, cloudantFactory, request, obj_helper, photoHelper, upload) {

        const options = {
            "method": 'POST',
            "url": 'http://bruno.mybuemix.net/analyse',
            "headers": {
                'content-type': 'application/x-www-form-urlencoded'
            },
            "form": {

            }
        };


        app.post('/storeMemory', upload.single('photo'), function (req, res) {

            // request(options, function (error, response, body) {
            //     if (error) {
            //         res.status(400).send("error on upload image")
            //     } else {
            //
            //     }
            // });


            photoHelper.getMatadata(req.file.buffer).then(function (metadata) {
                obj_helper.upload(metadata.id, req.file.buffer).then(function (response) {
                    res.status(200).send(response);
                }).catch(function (err) {
                    res.status(400).send(err);
                });
            }).catch(function (err) {
                res.status(400).send(err);
            });

        });
    };

}());
