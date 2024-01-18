const sql = require('./db');
var { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');
const config = require('../../config');
var { v4: uuid } = require('uuid');
const { KBRcontractENDPOINT } = require('../../utils/common');
var dbFunc = require('./db-function');
var axios = require('axios');
const moment = require("moment");
const { decryptData, encryptData, isRealString } = require('../../utils/validation')
const { FROM_EMAIL, SEND_GRID_KEY } = require("../../utils/common");

// const { param } = require('g:/kuber/app/routes/routes');



const User = function (data) {
    this.first_name = data.first_name;
    this.created_at = data.created_at;
}

function generatePassword() {
    var length = 7,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

User.register = function (param, result) {
    console.log(">>>>>>>>>Login_____register_____>>>>", param);
    const data = {};
    const id = uuid();

    sql.query("Select uu.*,us.isAdmin,us.referral_code,us.username,us.email,us.refer_active,us.id,us.isAdmin,us.level from user as uu left join users as us ON uu.user_id=us.id  where uu.wallet_address=?", [param.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            result(null, data);
        } else {
            if (res.length == 0) {
                if (param.sponsor_id) {

                    // console.log("...............................", param.sponsor_id)
                    sql.query("select us.*,us.id from users as us left JOIN user as uu on us.id=uu.user_id where us.referral_code=?", [param.sponsor_id], function (error, res1) {
                        if (error) {
                            data['err'] = true;
                            data['msg'] = error.code;
                            data['body'] = [error];
                            result(null, data);
                        } else {
                            if (res1[0].refer_active == '1') {
                                var sponsorAddress = res1[0].id;
                                console.log("spppppppppppppppponsor", sponsorAddress);
                                sql.query("insert into user (`user_id`,`wallet_address`) value (?,?)", [id, param.id], function (error, res2) {
                                    if (error) {
                                        data['err'] = true;
                                        data['msg'] = error.code;
                                        data['body'] = [error];
                                        result(null, data);
                                    } else {
                                        console.log(">>>>res2>>>>>>>", res2);
                                        // sql.query("select uu.*,us.investment_amount,us.is_closed,us.id from user as uu left join user_pool as us on uu.user_id=us.user_id where uu.wallet_address=?", [param.id], function (error, resss) {
                                        sql.query("select * from user where wallet_address=?", [param.id], function (error, resss) {
                                            if (error) {
                                                result(null, data);
                                            } else {
                                                // if(resss[0].investment_amount > 0){
                                                console.log("ressssssssssssssssssssssss", resss);
                                                var userId = resss[0].user_id;
                                                var referral = generatePassword();
                                                sql.query("insert into users (`id`,`sponsor_id`,`isAdmin`,`referral_code`) value (?,?,'1',?)", [userId, sponsorAddress, referral], function (error, insertData) {
                                                    if (error) {
                                                        console.log("error........error..........", error);
                                                        console.log("?????????????????????????????usersss", insertData);
                                                        result(null, data);
                                                    } else {
                                                        // console.log("res3........res3...........", insertData);
                                                        var token = jwt.sign({ username: "", user_id: id, email: "", isAdmin: 1, address: param.id },
                                                            config.secret,
                                                            {
                                                                expiresIn: '1 days'
                                                            }
                                                        )

                                                        const finalresult = {
                                                            username: "",
                                                            email: "",
                                                            isAdmin: 1,
                                                            token: token,
                                                            referralCode: referral,
                                                            level: 0,
                                                            // refer_active: res[0].refer_active
                                                        }
                                                        data['err'] = false;
                                                        data['msg'] = "login successfully";
                                                        data['body'] = finalresult;
                                                        result(null, data);
                                                    }
                                                })
                                            }
                                        })

                                    }
                                })
                            } else {
                                data['err'] = false;
                                data['msg'] = "referral system not active";
                                data['body'] = [];
                                result(null, data);
                            }
                        }
                    })
                } else {
                    data['err'] = true;
                    data['msg'] = "A sponsor is required for login";
                    data['body'] = [];
                    result(null, data);
                }
            } else {
                var token = jwt.sign({ username: res[0].username, user_id: res[0].user_id, email: res[0].email, isAdmin: res[0].isAdmin, address: res[0].wallet_address },
                    config.secret,
                    {
                        expiresIn: '1 days'
                    }
                )
                console.log("tokkkkkken", token);
                const finalresult = {
                    username: res[0].username,
                    email: res[0].email,
                    isAdmin: res[0].isAdmin,
                    token: token,
                    referralCode: res[0].referral_code,
                    level: res[0].level,
                    refer_active: res[0].refer_active
                }
                data['err'] = false;
                data['msg'] = "login successfully";
                data['body'] = finalresult;
                result(null, data);
            }
        }
    })
}

User.editUser = function (param, result) {
    const data = {}
    console.log("<<>>>>>>>>>paesefrdfrdrfdparam", param);
    var activation_code = String(new Date().getTime());
    // console.log("acttttttttttttt", typeof activation_code);
    const insertData = {
        username: param.username,
        first_name: param.first_name,
        last_name: param.last_name,
        email: param.email,
        activation_code: activation_code
    }
    if (param && param.profilePic) {
        insertData.profile_picture = param.profilePic ? param.profilePic : ''
    }
    sql.query("select * from users where id=?", [param.id], function (err, res1) {
        if (err) {
            data['err'] = true;
            data['msg'] = err.code;
            data['body'] = [];
            result(null, data);
        } else {
            sql.query("update users set ? where id=?", [insertData, param.id], function (error, res) {
                if (error) {
                    data['err'] = true;
                    data['msg'] = error.code;
                    data['body'] = [];
                    result(null, data);
                    console.log('---------------error-----', error)
                } else {

                    if (param.email) {
                        if (res1[0].email_confirm == 0) {

                            let btmMailTemp = "CALL mailTempMasterinsertupdatedelete(40, '', '', '', '', 'Select')";
                            sql.query(btmMailTemp, function (err, tempres) {
                                tempres[0] = tempres[0][0];
                                var userData = {};
                                // console.log("Mail Template Response Mail Template Response Mail Template Response >>>>>", tempres[0]);
                                userData.message = tempres[0].template_body;
                                userData.email = param.email;
                                userData.subject = tempres[0].template_subject;
                                userData.activation_code = encryptData(activation_code);
                                sentMail(userData, function (callbackres) {
                                    console.log(callbackres);
                                });
                            });
                            sql.query("select * from users where id=?", [param.id], function (err, res1) {
                                console.log(res1.length);
                            })
                            data['err'] = false;
                            data['msg'] = "Data updated and please confirmed your email";
                            data['body'] = res1;
                            result(null, data);
                        } else {
                            data['err'] = false;
                            data['msg'] = "email already updated";
                            data['body'] = [];
                            result(null, data);
                        }
                    } else {
                        data['err'] = false;
                        data['msg'] = "Data updated ";
                        data['body'] = res1;
                        result(null, data);
                    }
                }
            })


        }

    })
}



function sentMail(argument) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(SEND_GRID_KEY);

    // console.log("<<<<<<<<<<<<>>>>>>>>>>>>", argument)
    if (argument.email) {
        var username = argument.firstname;
        var message = argument.message;
        message = message.replace('[username]', username);
        message = message.replace('[activation_code]', argument.activation_code);
        message = message.replace('[activation_code]', argument.activation_code);
        message = message.replace('[activation_code]', argument.activation_code);
        let messageBodyJson = message
        const msg = {
            to: "vishal.ktrickywebsolutions@gmail.com",//argument.email,
            from: `HouseFI <${FROM_EMAIL}>`,
            subject: argument.subject,
            html: messageBodyJson
        };

        //sgMail.send(msg);

        // Send Email With Exception Handling
        sgMail.send(msg)
            .then(() => {
                console.log(`mail to ${argument.email} is sent`);
            }).catch(error => {
                const { message, code, response } = error;
                console.log(`${error.code} :${error.message}`);
            });
    } else {
        console.log("Please provide the emailID", argument);
    }
}

User.confirmation = function (userData, result) {
    var data = {}

    var activation_code = userData.activation_code;

    sql.query("Select TIMESTAMPDIFF(HOUR,FROM_UNIXTIME(`created_on`/1000, '%Y-%m-%d %H:%i:%s'),CURRENT_TIMESTAMP()) as hours,activation_code,email_confirm, id,username,email,password,sponsor_id from users  WHERE activation_code = ?", [activation_code], function (err, res) {
        if (err) {
            data['error'] = true;
            data['msg'] = err.code;
            data['body'] = [];
            dbFunc.connectionRelease;
            result(null, data);
        }
        else {
            console.log(res)
            if (res.length != 0) {
                var active = res[0].email_confirm;
                var userID = res[0].id;
                var username = res[0].username;
                var sendTO = res[0].sponsor_id;
                var email = res[0].email;
                var hours = res[0].hours;
                var hoursLeft = 96 - hours;
                var enc_code = decryptData(res[0].activation_code);
                var new_activation_code = decryptData(userData.activation_code);;
                console.log("..............", new_activation_code)
                if (active == 0) {
                    let updateUserData = {};
                    if (new_activation_code == enc_code)
                        updateUserData['email_confirm'] = '1';
                    // console.log("user>>>>>>>>", updateUserData, new_activation_code, activation_code)
                    sql.query("UPDATE `users` SET ? where id=?", [updateUserData, userID], function (err, row) {
                        if (err) {
                            console.log(err);
                            data['error'] = true;
                            data['msg'] = err.code;
                            data['body'] = [];
                            dbFunc.connectionRelease;
                            result(null, data);
                        }
                        else {
                            var mailData = {};
                            mailData.email = email;
                            mailData.userID = userID;
                            mailData.username = username;

                            data['error'] = false;
                            // var msg = langJson['emailconfirm'][lang];
                            data['msg'] = "email confirmation successfully";
                            data['body'] = [row];
                            dbFunc.connectionRelease;
                            result(null, data);
                        }
                    });
                } else {
                    data['error'] = true;
                    // var msg = langJson['emailconfirmed'][lang];
                    data['msg'] = "Email already verified";
                    data['body'] = [];
                    dbFunc.connectionRelease;
                    result(null, data);
                }
            } else {
                data['error'] = true;
                // var msg = langJson['invalidactiveCode'][lang];
                data['msg'] = "Invalid Activation Key";
                data['body'] = [];
                dbFunc.connectionRelease;
                result(null, data);
            }
        }
    });

};

User.getUser = function (param, result) {
    const data = {}

    sql.query("Select * from users where id=?", [param.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [];
            result(null, data);
        } else {
            //console.log("<<>>>", insertData);
            data['err'] = false;
            data['msg'] = "Data fetch successfully";
            data['body'] = res;
            result(null, data);
        }
    })
}

User.deposit = function (param, result) {
    const data = {};
    var bnbAmount = parseFloat(param.amount);
    // console.log("????????", param);
    // sql.query("select * from user where wallet_address=?", [param.id], function (error, res) {

    //     if (!res[0].sponsor_id) {
    //         data['error'] = false;
    //         data['msg'] = "You are not authorized to make this request";
    //         data['body'] = [];
    //         result(null, data);
    //     } else {
    // sql.query("select min_deposit from gb_min_amounts", function (error, res1) {
    //     if (error) {
    //         data['err'] = true;
    //         data['msg'] = error.code;
    //         data['body'] = [];
    //         result(null, data);
    //     } else {
    //         // console.log("???????????????res1[0].min_deposit ", res1[0].min_deposit);
    //         if (res1[0].min_deposit < bnbAmount) {

    // client.createTransaction(opt, function (err, callResult) {
    //     if (err) {
    //         //console.log("err err err >>>>>>>>>>>>>>>", err);
    //         data['success'] = false;
    //         data['message'] = "System is in maintenance, try after sometime";
    //         data['data'] = err;
    //         result(data);
    //     } else {
    //         var txn_id = callResult.txn_id;

    // var icobonus = 0;
    // var phase_type = '1';
    // var baseBNBAmount = BNB;
    // const oneBTC = orderData.cryptoCurrentAmount;

    // var investAmount = bnbAmount;
    // var amount_in_usd = orderData.usd;
    // var feeAmount = amount_in_usd * feePer / 100
    // var confirmations = callResult.confirms_needed;
    // var payment_url = callResult.status_url;
    // var bar_code_image = callResult.qrcode_url;
    // var send_data = {
    // 	'order_id': invoice_id,
    // 	'payment_url': payment_url,
    // 	'bar_code_image': bar_code_image,
    // 	'address': address,
    // 	'amount_in_usd': orderData.usd - feeAmount,
    // 	'amount': BNB,
    // 	pack_type: 'houseFIDeposit',
    // 	'baseBTCAmount': baseBTCAmount,
    // 	'timeout': callResult.timeout
    // };
    // var recordData = {
    // 	'phase_type': phase_type,
    // 	'confirmations': confirmations,
    // 	'payment_id': txn_id,
    // 	'status_url': status_url,
    // 	'ico_bonus': icobonus,
    // 	'bonus_uz_coin': 0,
    // 	'uz_coin': 0,
    // 	'payment_type': orderData.currency,
    // 	'user_id': orderData.userID,
    // 	'amount_in_usd': orderData.usd - feeAmount,
    // 	'amount': BTC,
    // 	'order_id': invoice_id,
    // 	'address': address,
    // 	'payment_status': '0',
    // 	pack_type: 'houseFIDeposit',
    // 	'baseBTCAmount': baseBTCAmount,
    // 	order_type: 'buy',
    // 	fee_usd: feeAmount,
    // 	payment_data: JSON.stringify(send_data)
    // };
    var invoice_id = param.user_id + '' + new Date().getTime();
    var record = {
        'order_id': invoice_id,
        'payment_type': param.currency,
        //'amount_in_usd': param.usd,
        'amount': bnbAmount,
        order_type: 'deposit',
        'payment_status': '1',
        'user_id': param.user_id,
        'payment_id': param.payment_id
    }
    console.log("?????????", record);
    sql.query("INSERT INTO gb_payment_history set ?", [record], function (error, res2) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = "Payment success";
            data['body'] = res2;
            result(null, data);
        }
    })
    // }
    //             // })
    //         } else {
    //             data['err'] = true;
    //             data['msg'] = "please deposit minimum amount ";
    //             data['body'] = [];
    //             result(null, data);
    //         }

    //     }
    // })
}

User.checkPaymentStatus = function (params, result) {
    var data = {}
    // var payment_id = params.payment_id
    // var user_id = params.user_id
    sql.query(`Select payment_id, amount,
    (SELECT deposit_fee from gb_min_amounts) as deposit_fee, 
    datediff(date(NOW()),date(crdate)) as daydiff, id,order_id,user_id, 
    payment_status,payment_type,amount_in_usd 
    FROM gb_payment_history WHERE payment_status='0' and payment_id!='0' and payment_id=?`, [params.id], (error, res) => {
        if (error) {
            console.log(error);
            data['error'] = true;
            data['msg'] = error.code;
            data['body'] = [];
            // dbFunc.connectionRelease;
            result(data);
        } else {
            console.log("???????????????", res);
            if (res[0].payment_id != 0) {
                sql.query("update gb_payment_history set `payment_status`='1' where payment_id=?", [res[0].payment_id], function (error, res1) {
                    if (error) {
                        console.log(error);
                        data['error'] = true;
                        data['msg'] = error.code;
                        data['body'] = [];
                        // dbFunc.connectionRelease;
                        result(data);
                    } else {

                        data['error'] = false;
                        data['msg'] = "payment successful";
                        data['body'] = res1;
                        // dbFunc.connectionRelease;
                        result(data);
                    }
                })
            } else {
                data['error'] = false;
                data['msg'] = "payment already done";
                data['body'] = [];
                // dbFunc.connectionRelease;
                result(data);
            }

        }
    })

}

// User.unlockReferral = function (params, result) {
//     var data = {};
//     var id = uuid();
//     console.log("ppppppppppppppppp", params);
//     params.token_amount = Number(params.token_amount);
//     sql.query("select * from  users where id=?", [params.id], function (error, res) {
//         if (error) {
//             data['err'] = true;
//             data['msg'] = error.code;
//             data['body'] = [error];
//             result(null, data);
//         } else {
//             var userID = res[0].id;
//             if (res.length != 0) {
//                 sql.query("select id,level,(kbr * 1000) as kbr from token", function (err, res1) {
//                     if (err) {
//                         data['err'] = true;
//                         data['msg'] = err.code;
//                         data['body'] = [error];
//                         result(null, data);
//                     } else {
//                         const level = parseInt(res[0].level) + 1;
//                         console.log("????????????lvl", level);
//                         console.log("????????????tkn", typeof params.token_amount);
//                         console.log("ddddata", typeof res1[0].kbr);
//                         var getData = res1.filter(data => {

//                             if (params.token_amount == data.kbr && level == data.level) {
//                                 return { ...getData }
//                             }
//                         })
//                         console.log(">>>>>>>>>>>>>>>>>>>>>>getdata", getData);
//                         if (getData.length != 0) {
//                             sql.query("insert into `gb_payment_history`(`user_id`,`order_id`,`amount`,`payment_id`,`order_type`,`payment_status`,`investment_status`) values (?,?,?,?,'unlocked','1','1')", [userID, id, params.token_amount, params.payment_id], function (error, res4) {
//                                 if (error) {
//                                     data['err'] = true;
//                                     data['msg'] = error.code;
//                                     data['body'] = [error];
//                                     result(null, data);
//                                 } else {
//                                     sql.query("update users set `level`=?,`token_amount`=? where id=?", [getData[0].level, params.token_amount, userID], function (err, res2) {
//                                         if (err) {
//                                             data['err'] = true;
//                                             data['msg'] = err.code;
//                                             data['body'] = [err];
//                                             result(null, data);
//                                         } else {
//                                             data['err'] = false;
//                                             data['msg'] = "success";
//                                             data['body'] = res2;
//                                             result(null, data);
//                                         }
//                                     })
//                                 }
//                             })
//                         } else {
//                             data['err'] = true;
//                             data['msg'] = "Wrong Amount submit";
//                             data['body'] = [error];
//                             result(null, data);
//                         }
//                     }
//                 })
//             } else {
//                 data['err'] = true;
//                 data['msg'] = "users not found";
//                 data['body'] = [];
//                 result(null, data);
//             }
//         }
//     })
// }

User.unlockReferral = function (params, result) {
    var data = {};
    sql.query("update users set `level`=? where id=?", [params.level, params.id], function (err, res) {
        if (err) {
            data['error'] = true;
            data['msg'] = err.code;
            data['body'] = [err];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['error'] = false;
            data['msg'] = "level updated";
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}

User.unilevelData = function (params, result) {
    var data = {}
    var id = params.user_id;
    sql.query(`SELECT id,(SELECT count(id) FROM users where is_deleted='0' and sponsor_id=?) as direct_users,first_name,last_name,email,created_at
    from users WHERE is_deleted='0' and sponsor_id=?`, [id, id], (error, res) => {
        if (error) {
            data['error'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            if (res.length != 0) {
                console.log("............res.......", res)
                const finalResult = res.map(item => {
                    return { ...item, level: params.level }
                })
                data['error'] = false;
                data['msg'] = "success";
                data['body'] = finalResult//encryptData(JSON.stringify(finalResult));
                dbFunc.connectionRelease;
                result(null, data);
            } else {
                data['error'] = true;
                data['msg'] = "No record found";
                data['body'] = [0]//encryptData(JSON.stringify(finalResult));
                dbFunc.connectionRelease;
                result(null, data);
            }
        }
    })
}

User.investment_pool = function (invest, result) {
    var id = uuid();

    var data = {};
    sql.query("select uu.*,us.current_active_pool,(SELECT COUNT(*) from gb_payment_history as gp where order_type='invest' and payment_status='1' and gp.user_id = uu.user_id) as total_investment from user as uu left join users as us on uu.user_id=us.id where wallet_address=?", [invest.address], function (error, ress) {
        if (error) {
            data['error'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            var invest_data = ress[0].total_investment;
            var current_pool = ress[0].current_active_pool
            invest.amount = Number(invest.amount);
            // if (invest_data == 0) {
            console.log("innnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn", invest_data);
            var userID = ress[0].user_id;
            // const investData = Common.poolData();
            sql.query("select id,poolLevel,(minInvest * 1000) as minInvest,(maxInvest*1000)as maxinvest,dailyProfite,monthlyProfite from profit_pools", function (error, res2) {
                if (error) {
                    data['error'] = true;
                    data['msg'] = error.code;
                    data['body'] = [error];
                    dbFunc.connectionRelease;
                    result(null, data);
                } else {
                    // console.log("kkkkkkkkkkkkkkkkkkkk",res2);

                    var filter1 = res2.filter(item => invest.amount >= item.minInvest && invest.amount <= item.maxInvest)
                    console.log("?????????????????????????gggg", filter1);
                    if (filter1.length === 0 && invest_data == 0) {
                        data['error'] = true;
                        data['msg'] = "Invested amount not matched with any pool"
                        data['body'] = [];
                        dbFunc.connectionRelease;
                        result(null, data);
                    } else {
                        // console.log("?????????????????????????kkkkkkkkkkkkkkkk", filter1);
                        // if (invest.re_investment == 0) {
                        const current_pool_id = current_pool ? res2.filter(item => item.poolLevel === current_pool)[0].id : 0
                        const invetment_pool_name = filter1.length > 0 ? filter1[0].poolLevel : ''
                        const invetment_pool_id = filter1.length > 0 ? filter1[0].id : ''
                        const poolLevel = current_pool ? current_pool_id > invetment_pool_id ? current_pool : invetment_pool_name : invetment_pool_name
                        const dailyProfite = res2.filter(item => item.poolLevel === poolLevel)[0].dailyProfite
                        var daily_returns = invest.amount * dailyProfite / 100;
                        const insertData = {
                            order_id: id,
                            payment_id: invest.payment_id,
                            user_id: userID,
                            pool: poolLevel,
                            investment_amount: invest.amount,
                            percentage: dailyProfite,
                            daily_return: daily_returns,//invest.amount * filter1[0].dailyProfite / 100,
                            invest_return: invest.amount * 2.5,
                            overall_time: invest.amount * 2.5 / daily_returns

                        }
                        console.log("?????????????????????????/", insertData);
                        if (invest.re_investment == 0) {

                            sql.query("insert into user_pool set ?", [insertData], function (error, res3) {
                                if (error) {
                                    data['error'] = true;
                                    data['msg'] = error.code;
                                    data['body'] = [error];
                                    dbFunc.connectionRelease;
                                    result(null, data);
                                } else {
                                    sql.query("insert into `gb_payment_history`(`user_id`,`order_id`,`amount`,`payment_id`,`order_type`,`payment_status`) values (?,?,?,?,'invest','1')", [userID, id, invest.amount, invest.payment_id], function (error, res4) {
                                        if (error) {
                                            data['error'] = true;
                                            data['msg'] = error.code;
                                            data['body'] = [error];
                                            dbFunc.connectionRelease;
                                            result(null, data);
                                        } else {
                                            console.log("_____________________________________res4.affectedRows > invest_data", res4.affectedRows, invest_data, res4.affectedRows > invest_data)
                                            if (res4.affectedRows > 0) {
                                                // console.log("........userID.............userID....", userID)

                                                sql.query("UPDATE `users` SET `refer_active`='1',`level`=?,`current_active_pool`=? WHERE id=? ", [1, insertData.pool, userID], function (error, res5) {
                                                    if (error) {
                                                        // console.log(".res5.......res5.............res5....", res5)
                                                        data['error'] = true;
                                                        data['msg'] = error.code;
                                                        data['body'] = [error];
                                                        dbFunc.connectionRelease;
                                                        result(null, data);

                                                    } else {
                                                        data['error'] = false;
                                                        data['msg'] = "investment success";
                                                        data['body'] = ress//encryptData(JSON.stringify(res1));
                                                        dbFunc.connectionRelease;
                                                        result(null, data);

                                                    }
                                                })
                                            } else {
                                                data['error'] = true;
                                                // data['msg1'] = error.message
                                                data['msg'] = "data not updated in payment_history";
                                                data['body'] = [];
                                                dbFunc.connectionRelease;
                                                result(null, data);
                                            }
                                        }
                                    })
                                }
                            })
                        } else {
                            sql.query("insert into user_pool set ?", [insertData], function (error, res3) {
                                if (error) {
                                    data['error'] = true;
                                    data['msg'] = error.code;
                                    data['body'] = [error];
                                    dbFunc.connectionRelease;
                                    result(null, data);
                                } else {
                                    sql.query("insert into `gb_payment_history`(`user_id`,`order_id`,`amount`,`payment_id`,`order_type`,`payment_status`,`re_investment`) values (?,?,?,?,'invest','1','1')", [userID, id, invest.amount, invest.payment_id], function (error, res4) {
                                        if (error) {
                                            data['error'] = true;
                                            data['msg'] = error.code;
                                            data['body'] = [error];
                                            dbFunc.connectionRelease;
                                            result(null, data);
                                        } else {
                                            if (res4.affectedRows > 0) {
                                                // console.log("........userID.............userID....", userID)

                                                sql.query("UPDATE `users` SET `current_active_pool`=? WHERE id=? ", [insertData.pool, userID], function (error, res5) {
                                                    if (error) {
                                                        // console.log(".res5.......res5.............res5....", res5)
                                                        data['error'] = true;
                                                        data['msg'] = error.code;
                                                        data['body'] = [error];
                                                        dbFunc.connectionRelease;
                                                        result(null, data);

                                                    } else {
                                                        data['error'] = false;
                                                        data['msg'] = "investment success";
                                                        data['body'] = ress//encryptData(JSON.stringify(res1));
                                                        dbFunc.connectionRelease;
                                                        result(null, data);

                                                    }
                                                })
                                            } else {
                                                data['error'] = true;
                                                data['msg'] = "data not updated in payment_history";
                                                data['body'] = [];
                                                dbFunc.connectionRelease;
                                                result(null, data);
                                            }
                                        }

                                    })
                                }
                            })
                        }
                    }
                }
            })
        }
    })
}

User.getUserPools = function (pools, result) {
    var data = {};
    sql.query("select up.*, us.level from user_pool as up LEFT join users as us on up.user_id=us.id where up.user_id=?", [pools.user_id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [];
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = "Data fetch successfully";
            data['body'] = res;
            result(null, data);
        }
    })
}

User.getKBRBalance = function (userData, result) {
    var data = {}
    let url = `${KBRcontractENDPOINT}/getBalanceKBR?address=${userData.address}`
    console.log("=====>>>>>>url", url)
    var config = {
        method: 'get',
        url,
    };

    axios(config)
        .then(function (response) {
            data = response.data
            data['msg'] = "success"
            result(null, data);
        })
        .catch(function (error) {
            result(null, error);
        });
}

User.getBusdBalance = function (userData, result) {
    var data = {}
    let url = `${KBRcontractENDPOINT}/getBalanceBUSD?address=${userData.address}`
    var config = {
        method: 'get',
        url,
    };

    axios(config)
        .then(function (response) {
            data = response.data
            data['msg'] = "success"
            result(null, data);
        })
        .catch(function (error) {
            result(null, error);
        });
}

User.sendKBR = function (userData, result) {
    var data = {}

    var privateKey = "a6b16afb9555809a997a73329e5b0250b4a5e0b973949120dd2678a9ae9431bb"//decryptData("f613fd9bc667bce37ff9a6dd2feb3b039819857332a39f5f7600773671904865822ca0750127442620a541558cecb8d288105249d8afe771862858ebbd2a1b6a");
    var amount = userData.amount;
    // var from_address = "0xf7ab36a405272208659d8a29046387c702576aa8"; // live address
    var from_address = "0xAE6658ad095EeDf3b1C5D49E616F9b0173634c16";
    var to_address = userData.to_address
    console.log("=======privateKey", privateKey);
    var url = `${process.env.endPoint}/KBRTokenTransfer?privateKey=${privateKey}&amount=${amount}&from_address=${from_address}&to_address=${to_address}`;
    console.log("URL==============", url);
    var config = {
        method: 'get',
        // url: `${KBRcontractENDPOINT}/KBRTokenTransfer?privateKey=${privateKey}&amount=${amount}&from_address=${from_address}&to_address=${to_address}`,
        url,
    };

    axios(config)
        .then(function (response) {
            data = response.data
            data['msg'] = "success"
            result(null, data);
        })
        .catch(function (error) {
            result(null, error);
        });
}

User.userTransaction = function (userData, result) {
    var data = {};
    sql.query("select * from gb_payment_history where user_id=? order by crdate desc", [userData.id], function (error, res) {
        if (error) {
            data['error'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            var filterdata = res.filter(data => {
                if (data.order_type == userData.order_type) {
                    return data
                }
            })
            // console.log("filterdata____________", filterdata.length);

            data['error'] = false;
            data['msg'] = "data fetch successfully";
            data['body'] = userData.order_type ? filterdata : res;
            dbFunc.connectionRelease;
            result(null, data);

        }
    })
}

const recurringUsers = (userIds, allUsers, count, result) => {
    // console.log("users", allUsers, userIds, count)
    if (userIds.length > 0) {
        sql.query("SELECT id from users where sponsor_id IN (?)", [userIds], (error, users) => {
            if (error) {
                console.log("..............recurring error", error)
                dbFunc.connectionRelease;
                result(true, null)
            } else {
                if (count == 12) {
                    dbFunc.connectionRelease;
                    result(false, allUsers)
                } else {
                    if (users.length > 0) {
                        // console.log("............useres", users)
                        const allIds = users.map(item => item.id)
                        var tempUsers = [...allUsers, ...allIds]
                        // console.log("..........temprsss", tempUsers)
                        dbFunc.connectionRelease;
                        recurringUsers(allIds, tempUsers, count + 1, result)
                    } else {
                        dbFunc.connectionRelease;
                        result(false, allUsers)
                    }
                }
            }
        })
    } else {
        result(false, allUsers)
    }

}

User.investment_pool = function (invest, result) {
    var id = uuid();

    var data = {};
    sql.query("select uu.*,us.current_active_pool,(SELECT COUNT(*) from gb_payment_history as gp where order_type='invest' and payment_status='1' and gp.user_id = uu.user_id) as total_investment from user as uu left join users as us on uu.user_id=us.id where wallet_address=?", [invest.address], function (error, ress) {
        if (error) {
            data['error'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {

            var invest_data = ress[0].total_investment;
            var current_pool = ress[0].current_active_pool
            invest.amount = Number(invest.amount)
            // console.log("cccccccccccccccccccccccccc", ress[0].current_active_pool);
            // if (current_pool == null) {
            //     invest.amount = invest.amount / 1000
            //     // console.log("innnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn", current_pool);
            // }

            // // if (invest_data == 0) {
            // // console.log("innnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn", current_pool);
            // console.log("innnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn", invest.amount);
            var userID = ress[0].user_id;
            // const investData = Common.poolData();
            sql.query("select id,poolLevel,(minInvest * 1000) as minInvest,(maxInvest * 1000) as maxInvest,dailyProfite,monthlyProfite from profit_pools", function (error, res2) {
                if (error) {
                    data['error'] = true;
                    data['msg'] = error.code;
                    data['body'] = [error];
                    dbFunc.connectionRelease;
                    result(null, data);
                } else {
                    console.log("kkkkkkkkkkkkkkkkkkkk", res2);


                    var filter1 = res2.filter(item => invest.amount >= item.minInvest && invest.amount <= item.maxInvest)
                    console.log("?????????????????????????gggg", filter1);
                    // const dailyProfite = res2.filter(item => item.poolLevel === poolLevel)[0].dailyProfite
                    // console.log("dailyyyyyyyyyyyyP", dailyProfite);

                    if (filter1.length === 0 && invest_data == 0) {
                        data['error'] = true;
                        data['msg'] = "Invested amount not matched with any pool"
                        data['body'] = [];
                        dbFunc.connectionRelease;
                        result(null, data);

                    } else {
                        // return;

                        console.log("?????????????????????????kkkkkkkkkkkkkkkk", filter1);
                        // if (invest.re_investment == 0) {
                        const current_pool_id = current_pool ? res2.filter(item => item.poolLevel === current_pool)[0].id : 0
                        const invetment_pool_name = filter1.length > 0 ? filter1[0].poolLevel : ''
                        const invetment_pool_id = filter1.length > 0 ? filter1[0].id : ''
                        const poolLevel = current_pool ? current_pool_id > invetment_pool_id ? current_pool : invetment_pool_name : invetment_pool_name
                        const dailyProfite = res2.filter(item => item.poolLevel === poolLevel)[0].dailyProfite
                        console.log("dailyyyyyyyyyyyyP", dailyProfite);
                        var daily_returns = invest.amount * dailyProfite / 100;
                        const insertData = {
                            order_id: id,
                            payment_id: invest.payment_id,
                            user_id: userID,
                            pool: poolLevel,
                            investment_amount: invest.amount,
                            percentage: dailyProfite,
                            daily_return: daily_returns,//invest.amount * filter1[0].dailyProfite / 100,
                            invest_return: invest.amount * 2.5,
                            overall_time: invest.amount * 2.5 / daily_returns

                        }
                        console.log("?????????????????????????insertdata/", insertData);
                        if (invest.re_investment == 0) {

                            sql.query("insert into user_pool set ?", [insertData], function (error, res3) {
                                if (error) {
                                    data['error'] = true;
                                    data['msg'] = error.code;
                                    data['body'] = [error];
                                    dbFunc.connectionRelease;
                                    result(null, data);
                                } else {
                                    sql.query("insert into `gb_payment_history`(`user_id`,`order_id`,`amount`,`payment_id`,`order_type`,`payment_status`) values (?,?,?,?,'invest','1')", [userID, id, invest.amount, invest.payment_id], function (error, res4) {
                                        if (error) {
                                            data['error'] = true;
                                            data['msg'] = error.code;
                                            data['body'] = [error];
                                            dbFunc.connectionRelease;
                                            result(null, data);
                                        } else {
                                            console.log("_____________________________________res4.affectedRows > invest_data", res4.affectedRows, invest_data, res4.affectedRows > invest_data)
                                            if (res4.affectedRows > 0) {
                                                // console.log("........userID.............userID....", userID)

                                                sql.query("UPDATE `users` SET `refer_active`='1',level='1',`current_active_pool`=? WHERE id=? ", [insertData.pool, userID], function (error, res5) {
                                                    if (error) {
                                                        // console.log(".res5.......res5.............res5....", res5)
                                                        data['error'] = true;
                                                        data['msg'] = error.code;
                                                        data['body'] = [error];
                                                        dbFunc.connectionRelease;
                                                        result(null, data);

                                                    } else {
                                                        ress[0]['current_active_pool'] = insertData.pool;
                                                        data['error'] = false;
                                                        data['msg'] = "investment successfully";
                                                        data['body'] = ress//encryptData(JSON.stringify(res1));
                                                        dbFunc.connectionRelease;
                                                        result(null, data);

                                                    }
                                                })
                                            } else {
                                                data['error'] = true;
                                                // data['msg1'] = error.message
                                                data['msg'] = "data not updated in payment_history";
                                                data['body'] = [];
                                                dbFunc.connectionRelease;
                                                result(null, data);
                                            }
                                        }
                                    })
                                }
                            })
                        } else {
                            sql.query("insert into user_pool set ?", [insertData], function (error, res3) {
                                if (error) {
                                    data['error'] = true;
                                    data['msg'] = error.code;
                                    data['body'] = [error];
                                    dbFunc.connectionRelease;
                                    result(null, data);
                                } else {
                                    sql.query("insert into `gb_payment_history`(`user_id`,`order_id`,`amount`,`payment_id`,`order_type`,`payment_status`,`re_investment`) values (?,?,?,?,'invest','1','1')", [userID, id, invest.amount, invest.payment_id], function (error, res4) {
                                        if (error) {
                                            data['error'] = true;
                                            data['msg'] = error.code;
                                            data['body'] = [error];
                                            dbFunc.connectionRelease;
                                            result(null, data);
                                        } else {
                                            if (res4.affectedRows > 0) {
                                                // console.log("........userID.............userID....", userID)

                                                sql.query("UPDATE `users` SET `current_active_pool`=? WHERE id=? ", [insertData.pool, userID], function (error, res5) {
                                                    if (error) {
                                                        // console.log(".res5.......res5.............res5....", res5)
                                                        data['error'] = true;
                                                        data['msg'] = error.code;
                                                        data['body'] = [error];
                                                        dbFunc.connectionRelease;
                                                        result(null, data);

                                                    } else {
                                                        ress[0]['current_active_pool'] = insertData.pool;
                                                        data['error'] = false;
                                                        data['msg'] = "investment success";
                                                        data['body'] = ress//encryptData(JSON.stringify(res1));
                                                        dbFunc.connectionRelease;
                                                        result(null, data);

                                                    }
                                                })
                                            } else {
                                                data['error'] = true;
                                                data['msg'] = "data not updated in payment_history";
                                                data['body'] = [];
                                                dbFunc.connectionRelease;
                                                result(null, data);
                                            }
                                        }

                                    })
                                }
                            })
                        }
                    }
                }
            })
        }
    })
}

const getUserRank = (team, result) => {
    sql.query("SELECT * from user_ranks", (error, allRanks) => {
        if (error) {
            result({ id: 1, rank: "Rookie" });
        } else {
            const foundedRank = allRanks.filter(item => {
                return item.id === 8 ? item.network_volume <= team && item.max_investment >= team : item.network_volume <= team
            })

            if (foundedRank.length > 0) {
                result({ id: foundedRank[0].id, rank: foundedRank[0].rank });
            } else {
                result({ id: 1, rank: "Rookie" });
            }
        }
    })
}

User.getPoolData = function (userData, result) {
    var data = {};
    sql.query("select * from profit_pools ", function (error, res) {
        if (error) {
            data['error'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            var poolData =
                console.log(">>>>>>>>>>>>>>>>>>>>>>", poolData);
            sql.query(`select gb.id,gb.user_id,gb.order_id,gb.payment_id,up.pool,up.invest_return,
            gb.amount,gb.payment_status,gb.payment_type,gb.order_type,gb.investment_status,
            up.daily_return,
            gb.re_investment,gb.crdate
            from gb_payment_history as gb LEFT JOIN user_pool as up on gb.order_id=up.order_id  where gb.order_type='invest' and gb.user_id=?`, [userData.id], function (error, res1) {
                if (error) {
                    data['error'] = true;
                    data['msg'] = error.code;
                    data['body'] = [error];
                    dbFunc.connectionRelease;
                    result(null, data);
                } else {
                    sql.query(`select us.current_active_pool,gs.bonus,gb.order_id,up.pool,
                    gb.amount,gb.order_type,gb.investment_status,
                    up.daily_return,
                    gb.re_investment,gb.crdate
                    from gb_payment_history as gb LEFT JOIN user_pool as up on gb.order_id=up.order_id left JOIN gb_daily_bonus as gs on gs.order_id= gb.order_id LEFT JOIN users as us on us.id=gb.user_id where gb.order_type='invest' and gs.coin='KBR' and gb.user_id=?`, [userData.id], function (error, res2) {
                        if (error) {
                            data['error'] = true;
                            data['msg'] = error.code;
                            data['body'] = [error];
                            dbFunc.connectionRelease;
                            result(null, data);
                        } else {

                            var filterdata = res.map(item => {
                                var investment = res1.filter(data => data.pool == item.poolLevel)
                                var bonusData = res2.filter(data => data.pool == item.poolLevel)
                                var totalReturns = investment.length > 0 ? investment.reduce((a, b) => a + b.invest_return, 0) : 0.00
                                var totalInvest = investment.length > 0 ? investment.reduce((a, b) => a + b.amount, 0) : 0.00
                                var dailyBonus = bonusData.length > 0 ? bonusData.reduce((a, b) => a + b.bonus, 0) : 0.00
                                var percentage = (dailyBonus / totalReturns * 100).toFixed(2);
                                console.log("dailybonus", dailyBonus);
                                item['investments'] = investment
                                item['totalReturns'] = totalReturns
                                item['dailybonus'] = dailyBonus
                                item['totalInvest'] = totalInvest
                                item['percentage'] = parseFloat(percentage) ? parseFloat(percentage) : 0
                                return item
                            })
                            data['error'] = false;
                            data['msg'] = "data fetch successfully";
                            data['body'] = filterdata;
                            dbFunc.connectionRelease;
                            result(null, data);
                        }
                    })
                }
            })
        }
    })
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
User.referralData = function (userData, result) {
    var data = {};
    sql.query("select us.id,us.first_name,us.email,us.profile_picture,(SELECT SUM(gb.bonus) FROM `gb_bonus_indirect`as gb where gb.user_id=?) as total_bonus,(SELECT SUM(gb.amount) from gb_payment_history as gb WHERE gb.order_type='invest' and gb.payment_status='1' and gb.user_id=us.id)as invested_amount,uu.wallet_address,uu.created_at from users as us left JOIN user as uu on us.id=uu.user_id where us.is_deleted='0'and us.sponsor_id=?", [userData.id, userData.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            result(null, data);
        } else {
            sql.query("Select count(*)as count,MONTHNAME(created_at) as month_name,YEAR(created_at)as year from users where date(created_at) BETWEEN '2021-11-01' and CURRENT_DATE and sponsor_id=? and YEAR(created_at)=? GROUP BY month_name;", [userData.id, userData.year], function (error, res1) {
                if (error) {
                    data['err'] = true;
                    data['msg'] = error.code;
                    data['body'] = [error];
                    result(null, data);
                } else {
                    var monthResult = months.map(data => {
                        var foundData = res1.filter(item => item.month_name == data);
                        if (foundData.length > 0) {
                            return foundData[0]
                        } else {
                            return {
                                "count": 0,
                                "month_name": data,
                                "year": userData.year
                            }
                        }
                    })
                    const finalResult = {
                        res,
                        monthResult

                    }
                    data['error'] = false;
                    data['msg'] = "Success";
                    data['body'] = finalResult;
                    dbFunc.connectionRelease;
                    result(null, data);
                }
            })
        }
    })
    // data['error'] = false;
    // data['msg'] = "Success";
    // data['body'] = res;
    // dbFunc.connectionRelease;
    // result(null, data);

}
User.withdraw = function (userdata, result) {
    var lang = 'en';
    // getDepositBal(userdata.userID);
    console.log('withdraw', userdata);
    if (userdata.lang) {
        var lang = userdata.lang;
    }
    var coin_type = 'USDT';
    if (userdata.coin_type) {
        coin_type = userdata.coin_type;
    }

    var exchange_type = "BTC_ETH";
    var uz_coin = 'uz_coin';
    if (userdata.coin_type == 'TOKEN') {
        uz_coin = 'token';
        exchange_type = "ETH_TOKEN";
    }
    if (userdata.coin_type == 'UZ') {
        coin_type = userdata.coin_type;
        var toLowerCase = coin_type.toLowerCase();
        var q = ""
    }
    q = "";
    const today = moment().format("YYYY-MM-DD");
    var data = {};
    // sql.query("CALL userWithdrawalSp(?, ?)",

    //     `SELECT uz_coin,(SELECT COALESCE(SUM(uz_coin),0.00) FROM gb_payment_history WHERE user_id=? and order_type='unlockInvestment' and payment_status='1') as unlock_amount,
    // (SELECT SUM(amount) AS todayWithdrawal FROM gb_v2_wth WHERE user_id=? AND payment_status='1' and date(crdate)=${today}) as todayWithdrawal,
    // (SELECT email from users WHERE id=?) as email,
    // (SELECT username from users WHERE id=?) as username, 
    // (SELECT COALESCE(SUM(bonus),0.00) from gb_bonus_direct WHERE user_id=? and distribute='1' and coin='BITPOOL')as direct_bonus,
    // (SELECT COALESCE(SUM(bonus),0.00) from gb_bonus_indirect WHERE user_id=? and distribute='1' and coin='BITPOOL')as indirect_bonus,
    // (SELECT COALESCE(SUM(bonus),0.00) from gb_daily_bonus WHERE user_id=? and distribute='1' and coin='BITPOOL')as daily_bonus,
    // (SELECT COALESCE(SUM(bonus),0.00) from gb_daily_bonus WHERE user_id=? and distribute='1' and coin='AMBASSADOR')as ambassador_bonus,
    // (SELECT COALESCE(SUM(amount+fee),0.00) from gb_v2_wth WHERE user_id=? and payment_status='0') as in_progress_amount,
    // (SELECT COALESCE(SUM(amount+fee),0.00) from gb_v2_wth WHERE user_id=? and payment_status='1') as already_withdrawal,
    // (SELECT eurbusd from conversion_prices) as oneBTC,(SELECT usdeth from conversion_prices) as oneETH,
    // (SELECT min_withdrawl from gb_min_amounts) as min_withdrawl from gb_wallet WHERE user_id=?`,
    sql.query(`SELECT sum(amount)as unlock_amount,
	(SELECT email from users WHERE id=?) as email,
	(SELECT username from users WHERE id=?) as username, 
	(SELECT COALESCE(SUM(bonus),0.00) from gb_bonus_direct WHERE user_id=? and coin='KBR')as direct_bonus,
	(SELECT COALESCE(SUM(bonus),0.00) from gb_bonus_indirect WHERE user_id=? and distribute='1' and coin='KBR')as indirect_bonus,
	(SELECT COALESCE(SUM(bonus),0.00) from gb_daily_bonus WHERE user_id=? and distribute='1' and coin='KBR')as daily_bonus,
	(SELECT COALESCE(SUM(bonus),0.00) from gb_daily_bonus WHERE user_id=? and distribute='1' and coin='KBR')as ambassador_bonus
     FROM gb_payment_history WHERE user_id=?and order_type='invest' and payment_status='1'`,
        [
            userdata.userID,
            userdata.userID,
            userdata.userID,
            userdata.userID,
            userdata.userID,
            userdata.userID,
            userdata.userID,
        ], function (err, useres) {
            console.log(">>>>>>>>users<<<<<<<<<<<<", useres[0])
            if (err) {
                console.log(err);
                data['error'] = true;
                data['msg'] = err.code;
                data['body'] = [];
                result(null, data);
            }
            else {
                console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>users", useres)
                sql.query("SELECT daily_withdrawal,withdrawal_fee from gb_min_amounts", (error, bitomaticLimit) => {
                    if (error) {
                        console.log(error);
                        data['error'] = true;
                        data['msg'] = error.code;
                        data['body'] = [];
                        result(null, data);
                    } else {
                        if (useres.length != 0) {
                            const withUsers = useres;
                            var secret = withUsers[0].two_fa_secret;
                            // var verified = speakeasy.totp.verify({
                            //     secret: secret,
                            //     encoding: 'base32',
                            //     token: userdata.otp
                            // });
                            var verified = true;
                            if (verified == true) {
                                const todayWithdrawal = withUsers[0].todayWithdrawal;
                                const witdrawLimit = bitomaticLimit[0].daily_withrawal;
                                var withdrawal_fee_per = bitomaticLimit[0].withdrawal_fee;
                                if (todayWithdrawal >= witdrawLimit) {
                                    data['error'] = true;
                                    data['msg'] = "Daily maximum withdrawal limit reached";
                                    data['body'] = [];
                                    result(null, data);
                                } else {
                                    getBalance(userdata, (error, callback) => {
                                        if (error) {
                                            data['error'] = true;
                                            data['msg'] = "balance not founded";
                                            data['body'] = [];
                                            result(null, data);
                                        } else {
                                            console.log('ELSEEEEE >>>>>>>>>>>>>>>>>', callback);
                                            const email = withUsers[0].email;
                                            const username = withUsers[0].username;
                                            var totalBalance = callback.body.balance
                                            var withdrawal_lock = moment().subtract(1, 'd').format("YYYY-MM-DD H:mm:ss");//callback.withdrawal_lock
                                            var currentDateTime = moment().format("YYYY-MM-DD H:mm:ss");


                                            totalBalance = parseFloat(totalBalance);//Number((totalBalance).toFixed(6));
                                            var amount = parseFloat(userdata.amount)//Number((userdata.amount).toFixed(6));
                                            console.log("type off userdata.amount", amount, userdata);
                                            console.log("<<<<<<<<<<<<>>>>>>>>>>>>>", withdrawal_lock, currentDateTime);
                                            if (withdrawal_lock > currentDateTime) {
                                                data['error'] = true;
                                                data['msg'] = "Withdrawal is locked for 24h";
                                                data['body'] = [];
                                                result(null, data);
                                            } else {
                                                if (totalBalance >= amount) {
                                                    var to = userdata.to;//"1JAKMQ4thFAnmF9HEHim1suMofsWoYd5r2";
                                                    if (coin_type == 'ETH' || coin_type == 'TOKEN' || coin_type == 'RTC') {
                                                        var splitAdd = to.split('');
                                                        to = (splitAdd[0] == '0' && splitAdd['1'] == 'x') ? to : '0x' + to;
                                                        // to = '0x'+to;
                                                    }
                                                    var valid = WAValidator.validate(to, coin_type);
                                                    if (valid) {
                                                        getOneBTCPric(null, (res) => {
                                                            if (res.EUR) {
                                                                var oneBTC = Number.parseFloat(res.EUR).toFixed(6);
                                                            } else {
                                                                var oneBTC = withUsers[0].eurbusd;
                                                            }
                                                            console.log('oneBTC', oneBTC);
                                                            var mini_withdrawal = withUsers[0].min_withdrawl;
                                                            withdrawal_fee = userdata.amount * withdrawal_fee_per / 100;
                                                            console.log('withdrawal_fee', withdrawal_fee);
                                                            console.log('mini_withdrawal', mini_withdrawal, 'amount', userdata.amount);
                                                            if (userdata.amount >= mini_withdrawal) {
                                                                var invoice_id = userdata.userID + '' + new Date().getTime();
                                                                console.log('withdraw ', userdata.amount + '-' + withdrawal_fee);
                                                                var amount = userdata.amount - withdrawal_fee;
                                                                var fee = withdrawal_fee;//*100000000;
                                                                //amount =amount*100000000;
                                                                var amount = Number((amount).toFixed(6));
                                                                amount_balance = amount / oneBTC;
                                                                console.log('withdraw amount>>>>>>>>>>>>>', amount, "oneBTC>>>>>>>>>>>>>>>>>", oneBTC, "amount_balance>>>>>>>>>>>>>>>>>>>>>", amount_balance);
                                                                var txid = '';
                                                                var confirmation_code = Math.floor(100000 + Math.random() * 900000);
                                                                var insertedData = { 'coin_type': "BUSD", 'invoice_id': invoice_id, 'fee': withdrawal_fee, 'payment_status': '0', 'txn_hash': txid, 'user_id': userdata.userID, 'amount': amount, 'bit_address': encryptData(to), amount_balance, email_confirm: '0', confirmation_code: encryptData(confirmation_code) };

                                                                // sql.query("SELECT * FROM `bitomatic_mail_template` WHERE id=30 order by id asc ", function (err, tempres) {
                                                                sql.query("CALL mailTempMasterinsertupdatedelete(45, '', '', '', '', 'Select')", function (err, tempres) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                        data['error'] = true;
                                                                        data['msg'] = err.code;
                                                                        data['body'] = [];
                                                                        result(null, data);
                                                                    } else {
                                                                        tempres[0] = tempres[0][0];
                                                                        var mailData = {};
                                                                        mailData.email = email;
                                                                        mailData.username = username;
                                                                        mailData.invoice_id = cryptrInvoice.encrypt(invoice_id);
                                                                        mailData.amount = amount;
                                                                        mailData.message = tempres[0].template_body;
                                                                        mailData.subject = tempres[0].template_subject;
                                                                        mailData.address = to;
                                                                        mailData.user_id = userdata.userID;
                                                                        mailData.confirmation_code = confirmation_code;
                                                                        let query = 'CALL insertWithdrawalSp(?, ?, ?, ?, ?, ?, ?)';
                                                                        sql.query(query, [
                                                                            insertedData.invoice_id,
                                                                            insertedData.fee,
                                                                            insertedData.user_id,
                                                                            insertedData.amount,
                                                                            insertedData.bit_address,
                                                                            insertedData.amount_balance,
                                                                            insertedData.confirmation_code
                                                                        ], function (err, rows) {
                                                                            if (err) {
                                                                                console.log(err);
                                                                                data['error'] = true;
                                                                                data['msg'] = err.code;
                                                                                data['body'] = [];
                                                                                result(null, data);
                                                                            }
                                                                            else {
                                                                                // withdrawConfimationMail(mailData);
                                                                                console.log("invoice_id", invoice_id)
                                                                                data['error'] = false;
                                                                                var msg = "Withdraw confirmation request sent in your email successfully";
                                                                                data['msg'] = msg;//"Success";
                                                                                data['body'] = [{ invoice_id }]//encryptData(JSON.stringify([{ invoice_id }]));
                                                                                console.log(data);
                                                                                result(null, data);
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                data['error'] = true;
                                                                var msg = langJson['limitcom'][lang];
                                                                data['msg'] = "Amount must be greater then mini withdrawal amount";
                                                                data['body'] = [];
                                                                result(null, data);
                                                            }
                                                        })
                                                    } else {
                                                        data['error'] = true;
                                                        data['msg'] = "Invalid " + coin_type + " address";
                                                        data['body'] = [];
                                                        result(null, data);
                                                    }
                                                } else {
                                                    data['error'] = true;
                                                    data['msg'] = "You have not sufficient balance.";
                                                    data['body'] = [];
                                                    data['totalBalance'] = totalBalance;
                                                    data['userdataAmount'] = userdata.amount;
                                                    result(null, data);
                                                }
                                            }
                                        }


                                    })

                                }
                            } else {
                                data['error'] = true;
                                data['msg'] = "2FA code not verified";
                                data['body'] = [];
                                result(null, data);
                            }

                        }
                    }
                })
            }
        })
}

User.getUserStats = function (params, result) {
    var data = {}
    var startDate = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
    var endDate = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
    let today = moment().format("YYYY-MM-DD");

    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>0", startDate, endDate);
    console.log(">>>>>>>params", params);
    sql.query(`SELECT COALESCE(SUM(amount),0.00) as totalInvestment,
    (SELECT COUNT(id) FROM users where is_deleted='0' and sponsor_id=?) as totalUsers,
    (SELECT COALESCE(SUM(amount),0.00)  FROM gb_payment_history WHERE MONTH(crdate)=MONTH(now())
    and YEAR(crdate)=YEAR(now()) and order_type='invest' and payment_status='1' and user_id=?) as current_month_investment,
    (SELECT COALESCE(SUM(bonus),0.00)
FROM gb_daily_bonus 
WHERE week(crdate)=week(now()) and user_id=?) as weekly_earning,
(SELECT COALESCE(SUM(bonus),0.00)  FROM gb_daily_bonus WHERE crdate BETWEEN ? and ? and user_id=?) as previousMonthBonus, 
(SELECT COALESCE(SUM(bonus),0.00)  FROM gb_daily_bonus WHERE MONTH(crdate)=MONTH(now()) and YEAR(crdate)=YEAR(now()) and user_id=?) as monthly_amount,
    (SELECT user_rank FROM users where id=?) as user_rank,
    (SELECT level FROM users where id=?) as refer_active,
    (SELECT current_active_pool FROM users where id=?) as active_pool,
    (SELECT COALESCE(SUM(amount),0.00) FROM gb_v2_wth WHERE payment_status IN ('1','0') and user_id=?) as withdrawal_amount,
    (SELECT level FROM users where id=?) as level,
    (SELECT COALESCE(SUM(bonus),0.00) as daily_return FROM gb_daily_bonus WHERE day(crdate)>=day(now()) and user_id=?)as todayReturn,
    (SELECT COALESCE(SUM(bonus),0.00) as totalReturned  FROM gb_daily_bonus WHERE coin='KBR' and user_id =?)as totalDailyReturned,
    (SELECT COALESCE(SUM(bonus),0.00) as totalReturned  FROM gb_bonus_direct WHERE coin='KBR' and user_id =?)as totalDirectReturned,
    (SELECT COALESCE(SUM(bonus),0.00) as totalReturned  FROM gb_bonus_indirect WHERE coin='KBR' and user_id =?)as totalInDirectReturned
    FROM gb_payment_history WHERE order_type='invest' and payment_status='1' and user_id = ?`, [params.user_id, params.user_id, params.user_id, startDate, endDate, params.user_id, params.user_id, params.user_id, params.user_id, params.user_id, params.user_id, params.user_id, params.user_id, params.user_id, params.user_id, params.user_id, params.user_id], (error, res) => {
        if (error) {
            console.log("eroor___________________", error)
            data['error'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            sql.query("SELECT id from users where sponsor_id=?", [params.user_id], (error, directUsers) => {
                if (error) {
                    data['error'] = true;
                    data['msg'] = error.code;
                    data['body'] = [];
                    dbFunc.connectionRelease;
                    result(null, data);
                } else {
                    console.log("/////////////", directUsers);
                    sql.query(`SELECT COUNT(*) FROM gb_payment_history where order_type='invest' and payment_status='1' and user_id=? 
                    GROUP by payment_id`, [params.user_id], (error, propertyData) => {
                        if (error) {
                            data['error'] = true;
                            data['msg'] = error.code;
                            data['body'] = [];
                            dbFunc.connectionRelease;
                            result(null, data);
                        } else {
                            console.log("................directUsers", propertyData)
                            if (directUsers.length > 0) {
                                const allIds = directUsers.map(item => item.id);
                                recurringUsers(allIds, allIds, 1, (error, indirectUsers) => {
                                    if (error) {
                                        console.log("error", error)
                                        result(true, null)
                                    } else {
                                        console.log(".............indirectUsers", indirectUsers)

                                        sql.query("SELECT id from users where sponsor_id IN(?)", (allIds), (error, twoLevelSponsor) => {
                                            if (error) {
                                                data['error'] = true;
                                                data['msg'] = error.code;
                                                data['body'] = [];
                                                dbFunc.connectionRelease;
                                                result(null, data);
                                            } else {
                                                const twoLevel = twoLevelSponsor.map(item => item.id);
                                                const twoLevelUsers = [...allIds, ...twoLevel];
                                                const totalUsers = [...indirectUsers];
                                                sql.query("SELECT COALESCE(SUM(amount),0.00) as totalInvestment FROM gb_payment_history WHERE order_type='invest' and payment_status='1' and user_id IN(?)", [twoLevelUsers], (error, team) => {
                                                    if (error) {
                                                        data['error'] = true;
                                                        data['msg'] = error.code;
                                                        data['body'] = [];
                                                        dbFunc.connectionRelease;
                                                        result(null, data);
                                                    } else {
                                                        // getUserRank(team_investment, calk => {
                                                        getPoolPercentage(params, (callback, result1) => {
                                                            console.log(callback);
                                                            let poolPercentage = 0
                                                            if (result1.err == false) {
                                                                poolPercentage = result1.body.percentage
                                                            }

                                                            // var total_return = res[0].totalDailyReturned + res[0].totalDirectReturned + res[0].totalInDirectReturned;
                                                            var withdrawal = res[0].withdrawal_amount * 1000;
                                                            console.log("LLLLLLLLLLLLLLLLLLLLLLL", withdrawal);
                                                            getUserRank(team, calk => {
                                                                res[0]['team'] = totalUsers.length;
                                                                res[0]['team_investment'] = team[0].totalInvestment
                                                                res[0]['user_rank'] = calk.rank
                                                                res[0]['total_withdraw'] = withdrawal
                                                                console.log("rankkkkkkkkkkkkkkkkkkkkkk", calk.rank);
                                                                sql.query("UPDATE users set user_rank=? WHERE id=?", [calk.rank, params.user_id], () => {
                                                                    dbFunc.connectionRelease;
                                                                })
                                                                res[0]['difPrevMonthBalance'] = res[0].totalDailyReturned - res[0].previousMonthBonus; //((res[0].totalDailyReturned - res[0].previousMonthBonus) / res[0].previousMonthBonus) * 100
                                                                res[0]['userStakePercentage'] = poolPercentage;
                                                                res[0]['totalReturned'] = (res[0].totalDailyReturned + res[0].totalDirectReturned + res[0].totalInDirectReturned) - withdrawal;
                                                                data['error'] = false;
                                                                data['msg'] = "Success";
                                                                data['body'] = res
                                                                dbFunc.connectionRelease;
                                                                result(null, data);
                                                            })


                                                        })
                                                    }
                                                })
                                            }
                                        })


                                    }
                                })
                            } else {
                                getPoolPercentage(params, (callback, result1) => {
                                    console.log(callback);
                                    let poolPercentage = 0
                                    if (result1.err == false) {
                                        poolPercentage = result1.body.percentage
                                    }
                                    // var total_return = res[0].totalDailyReturned + res[0].totalDirectReturned + res[0].totalInDirectReturned;
                                    var withdrawal = res[0].withdrawal_amount;
                                    res[0]['difPrevMonthBalance'] = res[0].totalDailyReturned - res[0].previousMonthBonus; //((res[0].totalDailyReturned - res[0].previousMonthBonus) / res[0].previousMonthBonus) * 100
                                    res[0]['team'] = directUsers.length;
                                    res[0]['team_investment'] = 0.00
                                    res[0]['user_rank'] = 'Rookie'
                                    res[0]['userStakePercentage'] = poolPercentage;
                                    // res[0]['lastMonthBonus'] = res[0].previousMonthBonus
                                    res[0]['totalReturned'] = (res[0].totalDailyReturned + res[0].totalDirectReturned + res[0].totalInDirectReturned) - withdrawal;
                                    data['error'] = false;
                                    data['msg'] = "Success";
                                    data['body'] = res
                                    dbFunc.connectionRelease;
                                    result(null, data);
                                })
                            }
                        }
                    })

                }
            })
            //     }
            // })

        }
    })
}

function getPoolPercentage(params, result) {
    var data = {};
    console.log(">>>>>>>>>>>>>", params);
    sql.query("select * from profit_pools ", function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            console.log(res);
            sql.query("select current_active_pool from users where id=?", [params.user_id], function (error, res2) {
                if (error) {
                    data['err'] = true;
                    data['msg'] = error.code;
                    data['body'] = error;
                    dbFunc.connectionRelease;
                    result(null, data);
                } else {
                    if (res2.length != 0) {


                        console.log("??????????????????????????", res2);

                        sql.query("SELECT SUM(investment_amount) as amount FROM `user_pool` where pool=? and user_id=?", [res2[0].current_active_pool, params.user_id], function (error, res1) {
                            if (error) {
                                data['err'] = true;
                                data['msg'] = error.code;
                                data['body'] = [error];
                                dbFunc.connectionRelease;
                                result(null, data);
                            } else {
                                console.log("??????????????????????????", res1);
                                var percentage = 0
                                var finalValue = {
                                    rankData: res,
                                    percentage: percentage
                                }
                                if (res1.length > 0) {
                                    var user_rank = res2[0].current_active_pool;
                                    console.log("uuuuuuuuuuuuuuuu", user_rank);
                                    var stakeAmount = res1[0].amount / 1000;
                                    console.log("stttttttttakkkk", stakeAmount);
                                    var foundedIndex = res.filter(val => val.poolLevel === user_rank);
                                    console.log("indddddddddddddddddddddex", foundedIndex);

                                    // if (foundedIndex > -1) {
                                    //     foundedIndex = foundedIndex + 1;
                                    //     percentage = foundedIndex / res.length * 100
                                    // }
                                    if (foundedIndex.length > 0) {
                                        var maxValue = foundedIndex[0].maxInvest;

                                        percentage = stakeAmount / maxValue * 100
                                        console.log("pppppppp", percentage);
                                        finalValue['percentage'] = percentage
                                    }

                                }
                            }

                            var finalValue = {
                                // investedAmount: stakeAmount,
                                // userPool: res2[0].current_active_pool,
                                // maxInvest: maxValue,
                                // userId: params.id,
                                percentage: percentage
                            }
                            data['err'] = false;
                            data['msg'] = 'Data fetch successfully';
                            data['body'] = finalValue;
                            dbFunc.connectionRelease;
                            result(null, data);


                        }
                        )
                    } else {
                        data['error'] = false;
                        data['msg'] = 'user urrent_pool not found';
                        data['body'] = [];
                        dbFunc.connectionRelease;
                        result(null, data);
                    }
                }
            })
        }
    })
}

User.userBonusGraph = function (userData, result) {
    var data = {};
    userData.year = userData.year ? userData.year : moment().format("YYYY")
    sql.query("Select sum(bonus) as totalBonus,MONTHNAME(crdate) as month_name,YEAR(crdate)as year from gb_bonus_direct where date(crdate) BETWEEN '2021-11-01' and CURRENT_DATE and user_id=? and YEAR(crdate)=? GROUP BY month_name", [userData.id, userData.year], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            result(null, data);
        } else {
            // console.log("direeeeeeeect", res);

            sql.query("Select sum(bonus) as totalBonus,MONTHNAME(crdate) as month_name,YEAR(crdate)as year from gb_bonus_indirect where date(crdate) BETWEEN '2021-11-01' and CURRENT_DATE and user_id=? and YEAR(crdate)=? GROUP BY month_name", [userData.id, userData.year], function (error, res1) {
                if (error) {
                    data['err'] = true;
                    data['msg'] = error.code;
                    data['body'] = [error];
                    result(null, data);
                } else {
                    // console.log("in>>>>>>>direeeeeeeect", res);
                    var monthResult = months.map(data => {
                        var directData = res.filter(item => item.month_name == data);
                        var indirectData = res1.filter(item => item.month_name == data);
                        // console.log(",,,,,,,,,,,,,,,,,,,,,,,,,,,,,", directData, indirectData);
                        // console.log(",,,,,,,,,,,,,,,,,,,,,,,,,,,,,", typeof directData[0].totalBonus);
                        let direct_bonus = 0
                        let indirect_bonus = 0
                        // return
                        if (directData.length > 0) {
                            direct_bonus = directData[0].totalBonus
                        }
                        if (indirectData.length > 0) {
                            indirect_bonus = indirectData[0].totalBonus
                        }
                        var monthBonusData = direct_bonus + indirect_bonus
                        return {
                            "totalBonus": monthBonusData,
                            "month_name": data,
                            "year": userData.year
                        }
                    })
                    data['error'] = false;
                    data['msg'] = "Success";
                    data['body'] = monthResult;
                    dbFunc.connectionRelease;
                    result(null, data);
                }
            })
        }
    })
    // data['error'] = false;
    // data['msg'] = "Success";
    // data['body'] = res;
    // dbFunc.connectionRelease;
    // result(null, data);

}

User.userReferralBonusDetails = function (userData, result) {
    var data = {};
    userData.year = userData.year ? userData.year : moment().format("YYYY")
    sql.query(`SELECT uu.user_id,
    us.profile_picture,us.first_name,us.current_active_pool,
    us.	created_at,
    (SELECT wallet_address from user WHERE user_id=uu.from_id) as wallet_address,
    SUM(uu.bonus) as bonus,uu.from_id,uu.crdate FROM gb_bonus_direct as uu
    LEFT JOIN users as us ON us.id = uu.from_id
    WHERE uu.user_id=? 
    GROUP by uu.from_id`, [userData.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            result(null, data);
        } else {

            sql.query(`SELECT uu.user_id,
            us.profile_picture,us.first_name,us.current_active_pool,
            us.	created_at,
            (SELECT wallet_address from user WHERE user_id=uu.user_id_origin) as wallet_address,
            SUM(uu.bonus) as bonus,uu.user_id_origin,uu.crdate FROM gb_bonus_indirect as uu
            LEFT JOIN users as us ON us.id = uu.user_id_origin
            WHERE uu.user_id=?
            GROUP by uu.user_id_origin`, [userData.id], function (error, res1) {
                if (error) {
                    data['err'] = true;
                    data['msg'] = error.code;
                    data['body'] = [error];
                    result(null, data);
                } else {
                    // console.log("direeeeeeeect", res);


                    data['error'] = false;
                    data['msg'] = "Success";
                    data['body'] = [...res, ...res1];
                    dbFunc.connectionRelease;
                    result(null, data);
                }
            })
        }
    })
}


module.exports = User;