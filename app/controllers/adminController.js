
const Admin = require('../model/adminModel');
const { param } = require('../routes/routes');
const jwtMiddle = require('./jwtMiddleware');
const { decryptData, encryptData } = require('../../utils/validation');
var Crykey = require('../../utils/common');
var CryptoJS = require("crypto-js");

exports.admLogin = function (req, result) {
    var param = req.body;
    Admin.admLogin(param, function (err, res) {
        if (err) result.send(err);
        result.json(res);
    })
}

exports.addProfitPools = function (request, result) {
    var param = request.body;
    Admin.addProfitPools(param, function (err, res) {
        if (err) result.send(err);
        result.json(res)
    })
}

exports.editProfitPools = function (request, result) {
    var param = request.body;
    Admin.editProfitPools(param, function (err, res) {
        if (err) result.send(err);
        result.json(res);
    })
}

exports.delProfitPools = function (request, result) {
    const param = request.params;
    Admin.delProfitPools(param, function (err, res) {
        if (err) result.send(err);
        result.json(res);
    })
}

exports.getProfitPools = function (request, result) {
    const param = request.params;
    Admin.getProfitPools(param, function (err, res) {
        if (err) result.send(err);
        result.json(res);
    })
}

exports.addRank = function (request, result) {
    var param = request.body;
    Admin.addRank(param, function (err, res) {
        if (err) result.send(err);
        result.json(res)
    })
}

exports.editRank = function (request, result) {
    var param = request.body;
    Admin.editRank(param, function (err, res) {
        if (err) result.send(err);
        result.json(res);
    })
}

exports.delRank = function (request, result) {
    const param = request.params;
    Admin.delRank(param, function (err, res) {
        if (err) result.send(err);
        result.json(res);
    })
}

exports.getRank = function (request, result) {
    const param = request.params;
    jwtMiddle.verifyToken(request, function (response) {
        if (response.error == false) {
            param.id = response.user_id;
            Admin.getRank(param, function (err, res) {
                if (err) result.send(err);
                result.json(res);

            })
        } else {
            result.json(response);
        }
    })
}

exports.addPercentage = function (request, result) {
    var param = request.body;
    Admin.addPercentage(param, function (err, res) {
        if (err) result.send(err);
        result.json(res)
    })
}

exports.editPercentage = function (request, result) {
    var param = request.body;
    Admin.editPercentage(param, function (err, res) {
        if (err) result.send(err);
        result.json(res);
    })
}

exports.delPercentage = function (request, result) {
    const param = request.params;
    Admin.delPercentage(param, function (err, res) {
        if (err) result.send(err);
        result.json(res);
    })
}

exports.getPercentage = function (request, result) {
    const param = request.params;
    Admin.getPercentage(param, function (err, res) {
        if (err) result.send(err);
        result.json(res);
    })
}

exports.getAllUser = function (req, res) {
    var data = {};
    var param = req.params;
    jwtMiddle.verifyToken(req, function (response) {
        if (response.error == false) {
            if (response.isAdmin == '2') {
                Admin.getAllUser(param, function (err, response) {
                    if (err)
                        res.send(err);
                    res.json(response);
                });
            } else {
                data['error'] = true;
                data['msg'] = 'Your not authorized to make this request';
                data['body'] = [];
                res.json(data);
            }
        } else {
            res.json(response);
        }

    })

}

exports.getAllCountry = (req, res) => {
    Admin.getAllCountry({}, (err, response) => {
        if (err)
            res.send(err)
        res.json(response)
    })
}

exports.getAllPools = (req, res) => {
    Admin.getAllPools({}, (err, response) => {
        if (err)
            res.send(err)
        res.json(response)
    })
}

exports.addKbrToken = function (request, result) {
    var param = request.body;
    Admin.addKbrToken(param, function (err, res) {
        if (err) result.send(err);
        result.json(res)
    })
}

exports.getKbrToken = function (request, result) {
    var param = request.query;
    jwtMiddle.verifyToken(request, function (response) {
        if (response.error == false) {
            param.id = response.user_id;
            Admin.getKbrToken(param, function (err, res) {
                if (err) result.send(err);
                result.json(res)
            })
        } else {
            result.json(response);
        }
    })
}

exports.dashboard = function (req, res) {
    var data = {};
    var param = req.params;
    //handles null error
    // jwtMiddleware.verifyToken(req, function (response) {
    //     if (response.error == false) {
    //         param.userId = response.userId
    Admin.dashboard(param, function (err, response) {
        if (err) {
            res.send(err);
        } else {
            res.json(response);
        }
    });
    //     } else {
    //         res.json(response);
    //     }
    // });
}

exports.allTransactions = function (req, result) {
    var param = req.query
    console.log("llllllllllllllllllllllllll", param);
    Admin.allTransactions(param, function (err, res) {
        if (err)
            result.send(err);
        result.json(res)

    })
}

exports.withdrawal = function (request, result) {
    var param = JSON.parse(decryptData(request.body.enc));//request.body;
    console.log(">>>>>>>>>>>>>>>>>>>prtrtrtdthgfhfdgrdrgdry", param);
    jwtMiddle.verifyToken(request, function (response) {
        if (response.error == false) {
            param.id = response.user_id;
            Admin.withdrawal(param, function (err, res) {
                if (err) result.send(err);
                result.json(res)
            })
        } else {
            result.json(response);
        }
    })
}

exports.approval = function (request, result) {
    var param = request.body;
    Admin.approval(param, function (err, res) {
        if (err) result.send(err);
        result.json(res)
    })
}

exports.getWithdrawalData = function (request, result) {
    var param = request.params;
    jwtMiddle.verifyToken(request, function (response) {
        if (response.error == false) {
            param.id = response.user_id;
            Admin.getWithdrawalData(param, function (err, res) {
                if (err) result.send(err);
                result.json(res)
            })
        } else {
            result.json(response);
        }
    })
}

exports.allWithdrawalData = function (request, result) {
    var param = request.params;
    Admin.allWithdrawalData(param, function (err, res) {
        if (err) result.send(err);
        result.json(res)
    })

}

exports.lastWithdrawal = function (request, result) {
    var param = request.params;
    jwtMiddle.verifyToken(request, function (response) {
        if (response.error == false) {
            param.id = response.user_id;
            Admin.lastWithdrawal(param, function (err, res) {
                if (err) result.send(err);
                result.json(res)
            })
        } else {
            result.json(response);
        }
    })
}

exports.bonusHistory = function (request, result) {
    var param = request.params;
    jwtMiddle.verifyToken(request, function (response) {
        if (response.error == false) {
            param.id = response.user_id;
            Admin.bonusHistory(param, function (err, res) {
                if (err) result.send(err);
                result.json(res)
            })
        } else {
            result.json(response);
        }
    })
}

exports.addMarketTools = function (request, result) {
    var param = request.body;
    Admin.addMarketTools(param, function (err, res) {
        if (err) result.send(err);
        result.json(res)
    })
}

exports.getMarketTools = function (request, result) {
    var param = request.params;
    Admin.getMarketTools(param, function (err, res) {
        if (err) result.send(err);
        result.json(res)
    })
}

exports.delMarketTools = function (request, result) {
    var param = request.params;
    Admin.delMarketTools(param, function (err, res) {
        if (err) result.send(err);
        result.json(res)
    })
}