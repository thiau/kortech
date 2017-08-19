(function () {
    "use strict";


    module.exports = function (app, cloudantFactory, request, obj_helper, photoHelper) {

        const options = {
            "method": 'POST',
            "url": 'http://bruno.mybuemix.net/analyse',
            "headers": {
                'content-type': 'application/x-www-form-urlencoded'
            },
            "form": {

            }
        };


        app.get('/storeMemory', function (req, res) {

            // request(options, function (error, response, body) {
            //     if (error) {
            //         res.status(400).send("error on upload image")
            //     } else {
            //
            //     }
            // });


            photoHelper.getMatadata(buffer).then(function (metadata) {
                console.log(metadata);
            }).catch(function (err) {
                console.log(error);
            });




        });
    };

}());
