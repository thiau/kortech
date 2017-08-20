/**
 * Created by danielabrao on 4/26/17.
 */
(function () {
    "use strict";

    module.exports = {
        "transformToUTC": function (date) {
            let factor = 0;
            if (date.getTimezoneOffset() !== 0) {
                factor = 1000 * 60 * 60 * (date.getTimezoneOffset() / 60);
            }

            return factor;
        },
        "transformDate": function (start, end, isPartial) {
            if (!start || !end) {
                return false;
            }

            if (typeof start === "string" && start.indexOf("-") > -1) {
                start = start.replace("-", "/");
            }
            if (typeof end === "string" && end.indexOf("-") > -1) {
                end = end.replace("-", "/");
            }

            try {
                let startDate = new Date(Number(start) || start);
                let endDate = new Date(Number(end) || end);

                if (isPartial) {
                    start = startDate.getTime();
                    end = endDate.getTime();
                } else {
                    start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0).getTime();
                    end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59).getTime();
                }

                if (end < start) {
                    return false;
                }
            } catch (err) {
                console.log(err);
                return false;
            }
            console.log({
                "start": start,
                "end": end,
                "difference": end - start
            });
            return {
                "start": start,
                "end": end,
                "difference": end - start
            };
        }
    };


}());
