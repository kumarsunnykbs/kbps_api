var submitticket = require('../model/spoortTicketModel');
const jwtMiddleware = require('./jwtMiddleware');

exports.submittickets = function (req, res) {
    var param = req.body//JSON.parse(decryptData(req.body.enc));
    var data = {};
    jwtMiddleware.verifyToken(req, function (response) {
        if (response.error == false) {
            param.userID = response.user_id;

            submitticket.submittickets(param, function (err, response) {
                if (err)
                    response.send(err);
                res.json(response);
            });



        } else {
            res.json(response);
        }
    });
}

exports.getTickets = function (req, res) {
    var data = {};
    // jwtMiddleware.verifyToken(req, function (response) {
    //     if (response.error == false) {
    submitticket.getTickets(req, function (err, response) {
        if (err)
            res.send(err);
        res.json(response);
    });
    //     } else {
    //         res.json(response);
    //     }
    // });
}

exports.addTicketComment = function (req, res) {
    var data = {};
    var param = req.body
    // jwtMiddleware.verifyToken(req, function (response) {
    //     if (response.error == false) {
    submitticket.addTicketComment(param, function (err, response) {
        if (err)
            res.send(err);
        res.json(response);
    });
    //     } else {
    //         res.json(response);
    //     }
    // });
}

exports.getTicketById = function (req, res) {
    var data = {};
    var param = req.params;
    jwtMiddleware.verifyToken(req, function (response) {
        if (response.error == false) {
            param.userID = response.user_id;
            submitticket.getTicketById(param, function (err, response) {
                if (err)
                    res.send(err);
                res.json(response);
            });
        } else {
            res.json(response);
        };
    })
}

exports.updateTicketStatus = function (req, res) {
    var data = {};
    // var param = req.params;
    var bodydata = req.body//JSON.parse(decryptData(req.body.enc));
    // bodydata.ticket_id = param.ticket_id;

    submitticket.updateTicketStatus(bodydata, function (err, response) {
        if (err)
            res.send(err);
        res.json(response);
    });
}

exports.getCommentData = function (req, res) {
    var data = {};
    // var param = req.params;
    var bodydata = req.params//JSON.parse(decryptData(req.body.enc));
    // bodydata.ticket_id = param.ticket_id;

    submitticket.getCommentData(bodydata, function (err, response) {
        if (err)
            res.send(err);
        res.json(response);
    });
}