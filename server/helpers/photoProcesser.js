(function () {
    "use strict";

    module.exports = function (ExifImage, cloudantFactory) {

        return {
            "getMatadata": function (photo_path) {
                return new Promise(function(resolve, reject) {
                    try {
                        new ExifImage({
                            image: photo_path
                        }, function (error, exifData) {
                            if (error) {
                                reject({
                                    "error": error
                                })
                            } else {
                                const datetime = exifData.image.ModifyDate;
                                const date = datetime.substr(0, datetime.indexOf(" ")).replace(/:/g, "-");
                                const time = datetime.substr((datetime.indexOf(" ") + 1), datetime.length);

                                resolve({
                                    "timestamp": new Date([date, time].join(" ")).getTime(),
                                    "datetime": {
                                        "date": date,
                                        "time": time,
                                    },
                                    "gps": {
                                        "latitude": exifData.gps.GPSLatitude,
                                        "longitude": exifData.gps.GPSLongitude
                                    }
                                });
                            }
                        });
                    } catch (error) {
                        reject({
                            "error": error
                        });
                    }
                });
            }
        }

    };
}());
