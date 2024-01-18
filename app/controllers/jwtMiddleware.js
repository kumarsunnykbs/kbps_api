var jwt = require('jsonwebtoken');
var config = require('../../config');
var jwtMiddleware = function (data) {
    this.first_name = data.first_name;
    this.created_at = new Date();
}

jwtMiddleware.verifyToken = function (req, result) {
    var data = {};
    if (req.url == '/login' || req.url == '/register' || req.url == '/countryList') {

        req.userId = '';
        data['error'] = false;
        data['auth'] = true;
        data['msg'] = "Success";
        data['body'] = [];
        result(data);
    } else {
        console.log("aaaaa req.headers['authorization']",req.headers['authorization'])
        var token = req.headers['authorization'];//req.params['authorization'];//req.headers['authorization'];
        if (!token) {
            data['error'] = true;
            data['auth'] = false;
            data['msg'] = "No token provided.";
            data['body'] = [];
            result(data);
        } else {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    data['error'] = true;
                    data['auth'] = false;
                    data['msg'] = "Failed to authenticate token.";
                    data['body'] = [];
                    result(data);
                } else {
                    if (req.files) {
                        console.log("File object", req.files);
                    }

                    console.log("decoded object", decoded);
                    req.userId = decoded.userId;
                    req.isAdmin = decoded.isAdmin;
                    data['error'] = false;
                    data['auth'] = true;
                    data['msg'] = "Success";
                    data['userId'] = decoded.userID;
                    data['isAdmin'] = decoded.isAdmin;
                    data['address'] = decoded.address;
                    data['user_id'] = decoded.user_id;
                    data['body'] = [];
                    result(data);
                }
            });
        }
    }
}
module.exports = jwtMiddleware;

