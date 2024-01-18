const { response } = require('express');
const Cron = require('../model/cronModel');
const cron = require('../model/cronModel');
const jwtMiddleware = require('./jwtMiddleware');

exports.giveDailyBonus = function (req, result) {
    var param = req.query;
    console.log("???????", param);
    Cron.giveDailyBonus(param, function (err, res) {
        if (err)
            result.send(err);
        result.json(res);

    })
}

// exports.giveDailyIndirectBonus = function (req, result) {
//     var param = req.query;
//     console.log("???????", param);
//     Cron.giveDailyIndirectBonus(param, function (err, res) {
//         if (err)
//             result.send(err);
//         result.json(res);

//     })
// }
exports.earningGraph = function (req, res) {
    var param = req.params
    jwtMiddleware.verifyToken(req, function (response) {
        if (response.error == false) {
            param.id = response.user_id
            Cron.earningGraph(param, function (err, response) {
                if (err)
                    res.send(err);
                res.json(response);
            });
        } else {
            res.json(response);
        }
    })
};
