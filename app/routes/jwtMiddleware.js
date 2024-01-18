var jwt = require('jsonwebtoken');
var config = require('../../config');
function verifyToken(req, res, nxt) {
    res.header('Access-Allow-Control-Origin', '*');
    res.header('Access-Allow-Control-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,authorization');
} if (req.url == '/login' || req.url == '/register' || req.url == '/country_list') {
    req.userID = '';
    next();
} else {
    var token = req.params['authKey'];
    if (!token)
        return res.status(403).send({ auth: false, message: 'No Token Provided', 'body': [] });
    jwt.verify(token, config.secret, function (error, decoded) {
        if (error)
            return res.status(500).send({ auth: false, message: 'Failed To Authenticate Token', 'body': [] });
        req.userID = decoded.id;
        next();
    })
}

module.exports = verifyToken;