const User = require('../model/userModel');
const jwtMiddleware = require('./jwtMiddleware');
const mv = require('mv');
const fs = require('fs')
const { ROOT_PATH } = require('../../config');
const { decryptData, encryptData } = require("../../utils/validation");
const path = require('path');


exports.register = function (request, result) {
    const param = request.body;
    User.register(param, function (err, res) {
        if (err) result.send(err);
        result.json(res);
    })
}


exports.editUser = function (req, res) {
    var param = req.body;
    // console.log("....................................param", param)
    // var langPar = req.query;
    // param['lang'] = langPar.lang;
    var data = {};
    jwtMiddleware.verifyToken(req, function (response) {
        // console.log("resssssssssssssss", response);
        if (response.error == false) {
            // if (response.isAdmin == '0') {
            param.id = response.user_id;
            if (req.param && !!param.id) {

                if (req.files) {
                    let imageFile = req.files.profilePic;
                    let imageUrl = ROOT_PATH;
                    var ext = path.extname(imageFile['name']);
                    if (ext.match(/jpg.*/) || ext.match(/png.*/)) {
                        var filename = Date.now() + '_download' + ext;
                        console.log("exttttttttt", ext);
                        // imageUrl = `${imageUrl}/images/${req.body.filename}.jpg`;
                        imageUrl = `${imageUrl}/images/${filename}`;
                        ////({req.imageFile.name})for direct photo default name use
                        // let imageUrl = `${__dirname}/image/${Date.now()}.jpg`;
                        // console.log("imageUrl", imageUrl, imageFile)
                        // console.log(">><<<<>><parar", param);
                        imageFile.mv(imageUrl, err => {
                            if (err) {
                                return res.status(500).send(err);
                            } else {
                                param.profilePic = imageUrl;
                                // console.log(">><<<<>><img", imageUrl);
                                User.editUser(param, function (err, response) {
                                    if (err)
                                        res.send(err);
                                    res.json(response);
                                });
                            }
                        });
                    } else {
                        data['error'] = true;
                        data['msg'] = 'plz provide only jpg and png ext';
                        res.json(data);
                    }

                } else {
                    // param.profilePic = '';
                    delete param["profilePic"]
                    console.log('---------------------------param---------------', param)
                    User.editUser(param, function (err, response) {
                        if (err)
                            res.send(err);
                        res.json(response);
                    });
                }
            } else {
                data['error'] = true;
                data['msg'] = 'Title and Description fields are required';
                data['body'] = [];
                res.json(data);
            }
            // } else {
            //     data['error'] = true;
            //     data['msg'] = 'Your not authorized to make this request';
            //     data['body'] = [];
            //     res.json(data);
            // }
        } else {
            res.json(response);
        }
    })
}


// const uploadPropertyImage = function (req) {

//     // var params = req.body;
//     return new Promise((resolve, rejects) => {
//         let imageFile = req.name;
//         console.log('image_____________', req.name)
//         let featured_image = `${__dirname}/images/${req.name}`;
//         console.log('<><><><>', featured_image);

//         imageFile.mv(featured_image, err, data => {
//             if (err) {
//                 console.log('error in callback');
//                 console.log(err);
//                 rejects(err)
//             }
//             resolve({ imgUrl: data.Location })
//         });
//     });

// }

exports.getUser = function (request, result) {
    const param = request.body;
    const data = {};
    jwtMiddleware.verifyToken(request, function (response) {
        if (response.error == false) {
            param.id = response.user_id
            User.getUser(param, function (err, res) {
                if (err) result.send(err);
                result.json(res);
            })
            // } else {
            //     data['error'] = true;
            //     data['msg'] = 'Your not authorized to make this request';
            //     data['body'] = [];
            //     result.json(data);
            // }
        } else {
            result.json(response);
        }
    }
    )
}

exports.deposit = function (request, result) {
    const param = request.body;
    const data = {};
    jwtMiddleware.verifyToken(request, function (response) {
        if (response.error == false) {
            param.user_id = response.user_id
            User.deposit(param, function (err, res) {
                if (err) result.send(err);
                result.json(res);
            })
            // } else {
            //     data['error'] = true;
            //     data['msg'] = 'Your not authorized to make this request';
            //     data['body'] = [];
            //     result.json(data);
            // }
        } else {
            result.json(response);
        }
    }
    )
}

exports.checkPaymentStatus = function (req, result) {
    const param = req.body;
    User.checkPaymentStatus(param, function (err, res) {
        if (err) result.send(err);
        result.json(res);
    })
}

exports.unlockReferral = function (req, result) {
    const param = req.body;
    jwtMiddleware.verifyToken(req, function (response) {
        if (response.error == false) {
            param.id = response.user_id
            User.unlockReferral(param, function (err, res) {
                if (err) result.send(err);
                result.json(res);
            })
        } else {
            result.json(response);
        }
    });
}

exports.FriendData = function (req, res) {
    var data = {};
    // var param = req.query ? JSON.parse(decryptData(req.query.enc)) : {}
    var param = req.query
    console.log(param)
    jwtMiddleware.verifyToken(req, function (response) {
        if (response.error == false) {
            param.user_id = response.user_id;
            User.FriendData(param, function (err, response) {
                if (err)
                    res.send(err);
                res.json(response);
            });
        } else {
            res.json(response);
        }
    });
}

exports.unilevelData = function (req, res) {
    var data = {};
    var param = req.query //? JSON.parse(decryptData(req.query.enc)) : {}
    console.log(param)
    jwtMiddleware.verifyToken(req, function (response) {
        if (response.error == false) {
            User.unilevelData(param, function (err, response) {
                if (err)
                    res.send(err);
                res.json(response);
            });
        } else {
            res.json(response);
        }
    });
}

exports.investment_pool = function (req, res) {
    var data = {};
    var param = req.body//req.body//req.body ? JSON.parse(decryptData(req.body.enc)) : {}
    console.log("545454545454545454", param)
    jwtMiddleware.verifyToken(req, function (response) {
        if (response.error == false) {
            // console.log("KKKKKKKKKKKKK", response);
            param.address = response.address
            User.investment_pool(param, function (err, response) {
                if (err)
                    res.send(err);
                res.json(response);
            });
        } else {
            res.json(response);
        }
    });
}

exports.getUserPools = function (req, result) {
    var param = {}
    jwtMiddleware.verifyToken(req, function (response) {
        if (response.error == false) {
            param.user_id = response.user_id;
            User.getUserPools(param, function (err, res) {
                if (err)
                    result.send(err);
                result.json(res)

            })
        } else {
            result.json(response);
        }

    })
}

exports.getKBRBalance = function (req, result) {
    var param = req.query
    User.getKBRBalance(param, function (err, res) {
        if (err)
            result.send(err);
        result.json(res)

    })
    // jwtMiddleware.verifyToken(req, function (response) {
    //     if (response.error == false) {
    //         param.user_id = response.user_id;
    //         User.getKBRBalance(param, function (err, res) {
    //             if (err)
    //                 result.send(err);
    //             result.json(res)

    //         })
    //     } else {
    //         result.json(response);
    //     }

    // })
}

exports.getBusdBalance = function (req, result) {
    var param = req.query
    console.log(param);
    User.getBusdBalance(param, function (err, res) {
        if (err)
            result.send(err);
        result.json(res)

    })

}
exports.sendKBR = function (req, result) {
    var param = req.body//JSON.parse(decryptData(req.body.enc));
    console.log("++++========", param);
    User.sendKBR(param, function (err, res) {
        if (err)
            result.send(err);
        result.json(res)

    })
    // jwtMiddleware.verifyToken(req, function (response) {
    //     if (response.error == false) {
    //         param.user_id = response.user_id;
    //         User.getKBRBalance(param, function (err, res) {
    //             if (err)
    //                 result.send(err);
    //             result.json(res)

    //         })
    //     } else {
    //         result.json(response);
    //     }

    // })
}

exports.userTransaction = function (req, result) {
    var param = { order_type: req.query.order_type ? req.query.order_type : '' }

    jwtMiddleware.verifyToken(req, function (response) {
        if (response.error == false) {
            param.id = response.user_id;
            User.userTransaction(param, function (err, res) {
                if (err)
                    result.send(err);
                result.json(res)

            })
        } else {
            result.json(response);
        }
    })
}

exports.getUserStats = function (req, res) {
    var data = {};
    // var param = req.query ? JSON.parse(decryptData(req.query.enc)) : {}
    var param = req.query
    console.log(param)
    jwtMiddleware.verifyToken(req, function (response) {
        if (response.error == false) {
            console.log(">>>>>>>__________user__stats____", response)
            param.user_id = response.user_id;
            User.getUserStats(param, function (err, response) {
                if (err)
                    res.send(err);
                res.json(response);
            });
        } else {
            res.json(response);
        }
    });
}

exports.getPoolData = function (req, res) {
    var data = {};
    // var param = req.query ? JSON.parse(decryptData(req.query.enc)) : {}
    var param = req.query
    console.log(param)
    jwtMiddleware.verifyToken(req, function (response) {
        if (response.error == false) {
            param.id = response.user_id;
            User.getPoolData(param, function (err, response) {
                if (err)
                    res.send(err);
                res.json(response);
            });
        } else {
            res.json(response);
        }
    });
}

exports.referralData = function (req, res) {
    var data = {};
    // var param = req.query ? JSON.parse(decryptData(req.query.enc)) : {}
    var param = req.query
    console.log(param)
    jwtMiddleware.verifyToken(req, function (response) {
        console.log(">>>>>>>>>>>>>>>>>>>..rs[[[[[", response);
        if (response.error == false) {
            param.id = response.user_id;
            User.referralData(param, function (err, response) {
                if (err)
                    res.send(err);
                res.json(response);
            });
        } else {
            res.json(response);
        }
    });
}
exports.withdraw = function (req, res) {
    // console.log("withdraw >>>>>>>>>>>>", req);
    var data = {};
    var param = req.body
    var langPar = req.query;
    param['lang'] = langPar.lang;
    if (!param.userID) {
        res.status(400).send({ error: true, message: 'Please provide userID!', body: [] });
    }
    else {
        jwtMiddleware.verifyToken(req, function (response) {
            console.log("withdrawal request JWT Token response", response);
            if (response.error == false) {
                console.log("......................>>>>>>>>>>>>>res..........", response, param)
                // if (response.user_id == param.userID) {
                User.withdraw(param, function (err, response) {
                    if (err)
                        res.send(err);
                    res.json(response);
                });
                // } else {
                //     data['error'] = true;
                //     data['msg'] = 'You are not authorized for this request';
                //     data['body'] = [];
                //     res.json(data);
                // }
            } else {
                res.json(response);
            }
        });
    }
}

exports.confirmation = function (req, res) {
    var param = req.params;
    console.log(req.params);
    var data = {};
    var langPar = req.query;
    param['lang'] = langPar.lang;
    // jwtMiddleware.verifyToken(req, function(response) {
    // if (response.error==false) { 
    if (req.param && !!param.activation_code) {
        User.confirmation(param, function (err, response) {
            if (err)
                response.send(err);
            res.json(response);
        });
    } else {
        data['error'] = true;
        data['msg'] = 'All field required';
        data['body'] = [];
        res.json(data);
    }
    //     }else{
    //         res.json(response);
    //     }
    // });

}

exports.verifyToken = function (req, res) {
    var data = {};
    // var param = req.query ? JSON.parse(decryptData(req.query.enc)) : {}
    var param = req.query
    console.log(param)
    jwtMiddleware.verifyToken(req, function (response) {
        console.log(">>>>>>>>>>>>>>>>>>>..rs[[[[[", response);
        if (response.error == true) {
            res.json(response);
        } else {
            res.json(response);
        }
    });
}

exports.userBonusGraph = function (req, res) {
    var data = {};
    // var param = req.query ? JSON.parse(decryptData(req.query.enc)) : {}
    var param = req.query
    console.log(param)
    jwtMiddleware.verifyToken(req, function (response) {
        console.log(">>>>>>>>>>>>>>>>>>>..rs[[[[[", response);
        if (response.error == false) {
            param.id = response.user_id;
            User.userBonusGraph(param, function (err, response) {
                if (err)
                    res.send(err);
                res.json(response);
            });
        } else {
            res.json(response);
        }
    });
}

exports.userReferralBonusDetails = function (req, res) {
    var data = {};
    // var param = req.query ? JSON.parse(decryptData(req.query.enc)) : {}
    var param = req.query
    console.log(param)
    jwtMiddleware.verifyToken(req, function (response) {
        console.log(">>>>>>>>>>>>>>>>>>>..rs[[[[[", response);
        if (response.error == false) {
            param.id = response.user_id;
            User.userReferralBonusDetails(param, function (err, response) {
                if (err)
                    res.send(err);
                res.json(response);
            });
        } else {
            res.json(response);
        }
    });
}