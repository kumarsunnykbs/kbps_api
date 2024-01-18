const sql = require('../model/db');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config');
var dbFunc = require('./db-function');
var { v4: uuid } = require('uuid');
var bcrypt = require('bcryptjs')
var CryptoJS = require("crypto-js");
const { decryptData, encryptData } = require('../../utils/validation')
// const cryptrInvoice = new Cryptr('2ydTj9JIbitomaticInvoice8CLJNlwJsecure');
var Crykey = require('../../utils/common');
const { response } = require('express');
const { FROM_EMAIL, SEND_GRID_KEY } = require("../../utils/common");


const Admin = function (data) {
    this.created_at = data.created_at
}

Admin.admLogin = function (param, result) {
    const data = {}
    console.log("????", param);
    sql.query("Select id,email,password as hash_key,username from adm_users where email=?", [param.email], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            console.log("hjhyjgj", res);
            if (res.length != 0) {
                var hash = res[0].hash_key;
                var match = bcrypt.compareSync(param.password, hash)

                if (match) {
                    let token = jwt.sign({ username: res[0].username, userID: res[0]._id, isAdmin: '2' },
                        config.secret,
                        {
                            expiresIn: '1 days' // expires in 30 Days
                        }
                    );
                    const finalResult1 = {
                        _id: res[0].id,
                        email: res[0].email,
                        username: res[0].username,
                        token: token,
                        isAdmin: '2'

                    }
                    data['err'] = false;
                    data['msg'] = "login successfully";
                    data['body'] = finalResult1;
                    dbFunc.connectionRelease;
                    result(null, data);
                    console.log(finalResult1);
                } else {
                    data['err'] = true;
                    data['msg'] = "password not matched";
                    data['body'] = [];
                    dbFunc.connectionRelease;
                    result(null, data);
                }
            } else {
                data['err'] = true;
                data['msg'] = "You are not authorized for this request";
                data['body'] = [];
                dbFunc.connectionRelease;
                result(null, data);
            }
        }
    })

}

Admin.addProfitPools = function (param, result) {
    const data = {}
    const insertData = {
        poolLevel: param.poolLevel,
        minInvest: param.minInvest,
        maxInvest: param.maxInvest,
        dailyProfite: param.dailyProfite,
        monthlyProfite: param.monthlyProfite
    }

    sql.query("insert into profit_pools set ? ", [insertData], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = "data added successfully";
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}

Admin.editProfitPools = function (param, result) {
    var data = {};
    const insertData = {
        poolLevel: param.poolLevel,
        minInvest: param.minInvest,
        maxInvest: param.maxInvest,
        dailyProfite: param.dailyProfite,
        monthlyProfite: param.monthlyProfite
    }
    sql.query("update profit_pools set ? where id=?", [insertData, param.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = "data updated successfully";
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }


    })
}

Admin.delProfitPools = function (param, result) {
    var data = {};
    console.log(">>>>>>>>>>>>>", param);
    sql.query("delete from profit_pools where id=?", [param.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = 'Data deleted successfully';
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}

Admin.getProfitPools = function (param, result) {
    var data = {};
    console.log(">>>>>>>>>>>>>", param);
    sql.query("select * from profit_pools ", function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = 'Data fetch successfully';
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}

Admin.addRank = function (param, result) {
    const data = {}
    const insertData = {
        rank: param.rank,
        agent_type: param.agent_type,
        network_volume: param.network_volume,
        max_investment: param.max_investment,
        prize: param.prize
    }
    sql.query("insert into user_ranks set ? ", [insertData], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = "data added successfully";
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}

Admin.editRank = function (param, result) {
    var data = {};
    const insertData = {
        rank: param.rank,
        agent_type: param.agent_type,
        network_volume: param.network_volume,
        max_investment: param.max_investment,
        prize: param.prize
    }
    sql.query("update user_ranks set ? where id=?", [insertData, param.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = "data updated successfully";
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }


    })
}

Admin.getRank = function (param, result) {
    var data = {};
    console.log(">>>>>>>>>>>>>", param);
    sql.query("select * from user_ranks ", function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            sql.query("select id,username,user_rank from users where is_deleted='0' and id=?", [param.id], function (error, res1) {
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
                        var user_rank = res1[0].user_rank
                        var foundedIndex = res.findIndex(val => val.rank === user_rank);
                        console.log("indddddddddddddddddddddex", foundedIndex);
                        if (foundedIndex > -1) {
                            foundedIndex = foundedIndex + 1;
                            percentage = foundedIndex / res.length * 100
                        }
                        finalValue['percentage'] = percentage
                    }

                    var finalValue = {
                        rankData: res,
                        percentage: percentage
                    }
                    data['err'] = false;
                    data['msg'] = 'Data fetch successfully';
                    data['body'] = finalValue;
                    dbFunc.connectionRelease;
                    result(null, data);


                }
            })

        }
    })
}



Admin.delRank = function (param, result) {
    var data = {};
    console.log(">>>>>>>>>>>>>", param);
    sql.query("delete from user_ranks where id=?", [param.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = 'Data deleted successfully';
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}

Admin.addPercentage = function (param, result) {
    const data = {}
    const insertData = {
        level: param.level,
        percentage: param.percentage


    }
    sql.query("insert into  level_bonus_percentage set ? ", [insertData], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = "data added successfully";
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}

Admin.editPercentage = function (param, result) {
    var data = {};
    const insertData = {
        level: param.level,
        percentage: param.percentage
    }
    sql.query("update level_bonus_percentage set ? where id=?", [insertData, param.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = "data updated successfully";
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }


    })
}

Admin.delPercentage = function (param, result) {
    var data = {};
    console.log(">>>>>>>>>>>>>", param);
    sql.query("delete from level_bonus_percentage where id=?", [param.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = 'Data deleted successfully';
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}

Admin.getPercentage = function (param, result) {
    var data = {};
    console.log(">>>>>>>>>>>>>", param);
    sql.query("select * from level_bonus_percentage ", function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = 'Data fetch successfully';
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}

Admin.getAllUser = function (param, result) {
    var data = {};
    sql.query("SELECT uu.id,us.wallet_address,uu.username,uu.email,uu.first_name,uu.last_name,uu.last_login,uu.phone,uu.profile_picture,uu.isAdmin,uu.created_at,uu.active,uu.birth_date,uu.gender,uu.is_deleted ,ud.country as country_name FROM users as uu left join user as us on us.user_id = uu.id LEFT JOIN country_list ud ON uu.country=ud.id ORDER By uu.created_at DESC", function (err, res) {
        if (err) {
            data['error'] = true;
            data['msg'] = err.code;
            data['body'] = [err];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['error'] = false;
            data['msg'] = "success";
            data['body'] = res//encryptData(JSON.stringify(res));
            dbFunc.connectionRelease;
            result(null, data);
        }
    })

}

Admin.getAllCountry = (params, result) => {
    let data = {}
    sql.query("SELECT * FROM country_list order by country ASC", (err, res) => {
        if (err) {
            data.error = true;
            data.msg = err.code;
            data.body = [err];
            dbFunc.connectionRelease;
            result(null, data)
        }
        else {
            data.error = false;
            data.msg = 'success';
            data.body = res;
            dbFunc.connectionRelease;
            result(null, data)
        }
    })
}

Admin.getAllPools = function (pools, result) {
    var data = {};
    sql.query("select * from user_pool order by created_at desc ", function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [];
            result(null, data);
        } else {
            data['err'] = true;
            data['msg'] = "Data fetch successfully";
            data['body'] = res;
            result(null, data);
        }
    })
}

Admin.addKbrToken = function (token, result) {
    var data = {};
    var insertData = {
        level: token.level,
        affiliate_earnings: token.affiliate_earnings,
        kbr: token.kbr,
        equal_in: token.equal_in
    }
    sql.query("insert into token set ?", [insertData], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = "Data add successfully";
            data['body'] = res;
            result(null, data);
        }
    })
}

Admin.getKbrToken = (params, result) => {
    let data = {}
    console.log(">>>>>>>>>>>>>", params);
    sql.query("select * from token ", (err, res) => {
        if (err) {
            data.error = true;
            data.msg = err.code;
            data.body = [err];
            dbFunc.connectionRelease;
            result(null, data)
        }
        else {

            sql.query("select level from users where id=?", [params.id], function (error, res1) {
                if (error) {
                    data.erroror = true;
                    data.msg = error.code;
                    data.body = [error];
                    dbFunc.connectionRelease;
                    result(null, data)
                }
                else {
                    console.log(">>>>>>>>>>>>>>>>>>>>level", res1);
                    console.log(">>>>>>>>>>>>>>>>>>>>level5415454454", res);
                    var allLevel = res.map(item => {
                        let active = {}
                        if (item.level <= res1[0].level) {
                            active = true;
                        } else {
                            active = false;
                        }
                        return { ...item, active }
                    });
                    data.error = false;
                    data.msg = 'success';
                    data.body = allLevel;
                    dbFunc.connectionRelease;
                    result(null, data)
                }
            })
            // data.error = false;
            // data.msg = 'success';
            // data.body = res;
            // dbFunc.connectionRelease;
            // result(null, data)
        }
    })
}

Admin.dashboard = function (userID, result) {
    var data = {};
    let today = userID.today_date ? moment(userID.today_date).format("YYYY-MM-DD") : "2021-09-21"
    var sqlQuery = "CALL `dashboardStatsSp`()";
    sql.query(sqlQuery, function (err, res) {
        // console.log(res)
        if (err) {
            data['error'] = 1;
            data['msg'] = err.code;
            data['body'] = [err];
            dbFunc.connectionRelease;
            result(null, data);
        }
        else {
            sql.query(`SELECT COALESCE(SUM(bonus),0.00) as dailyBonus,
            (SELECT COALESCE(SUM(bonus),0.00) as dailyBonus from gb_daily_bonus WHERE distribute='1' and coin='KBR' and MONTH(crdate) = MONTH(CURRENT_DATE()) ) as currentMonthDailyBonus,
            (SELECT COALESCE(SUM(bonus),0.00) as amount from gb_bonus_direct ) as directBonus,
            (SELECT COALESCE(SUM(bonus),0.00) as amount from gb_bonus_direct WHERE MONTH(crdate) = MONTH(CURRENT_DATE())) as currentMonthDirectBonus,
            (SELECT COALESCE(SUM(bonus),0.00) as amount from gb_bonus_indirect WHERE distribute='1' ) as indirectBonus,
            (SELECT COALESCE(SUM(bonus),0.00) as amount from gb_bonus_indirect WHERE distribute='1' and MONTH(crdate) = MONTH(CURRENT_DATE())) as currentMonthIndirectBonus
            from gb_daily_bonus WHERE distribute='1'`,

                [today, today, today], (error, bonuses,) => {

                    if (error) {
                        data['error'] = true;
                        data['msg'] = error.code;
                        data['body'] = [error];
                        dbFunc.connectionRelease;
                        result(null, data);
                    } else {
                        var tempRes = {}
                        var finalResult = res[0].map(item => {
                            tempRes[`${item.agent_type}`] = item.rank_count
                        })
                        let left_over_amount = res[0][0].left_over_amount ? res[0][0].left_over_amount : 0.00;
                        left_over_amount = parseFloat(left_over_amount) + bonuses[0].total_left;
                        // console.log("..........left_over_amt", left_over_amount);
                        let current_month_left = bonuses[0].current_month_left;
                        tempRes.active_users = res[0][0].active_users
                        tempRes.total_users = res[0][0].total_users
                        tempRes.inactive_users = res[0][0].inactive_users
                        tempRes.dailyBonus = bonuses[0].dailyBonus
                        tempRes.directBonus = bonuses[0].directBonus
                        tempRes.indirectBonus = bonuses[0].indirectBonus
                        tempRes.total_bonuses = bonuses[0].dailyBonus + bonuses[0].directBonus + bonuses[0].indirectBonus;
                        tempRes.current_month_bonus = bonuses[0].currentMonthDailyBonus + bonuses[0].currentMonthDirectBonus + bonuses[0].currentMonthIndirectBonus;
                        tempRes.all_investment = res[0][0].all_investment
                        tempRes.current_month_investment = res[0][0].current_month_investment
                        tempRes.total_deposit = res[0][0].all_deposit
                        tempRes.current_month_deposit = res[0][0].current_month_deposit
                        // tempRes.current_month_deposit = tempRes.current_month_deposit - (tempRes.current_month_deposit * 3 / 100)
                        // tempRes.total_deposit = tempRes.total_deposit - (tempRes.total_deposit * 3 / 100);
                        // tempRes.left_over_amount = left_over_amount
                        // tempRes.current_month_left = current_month_left

                        // console.log(".........tempRes", tempRes)
                        data['error'] = false;
                        data['msg'] = 'success';//data['msg']="Contact Detail Updated Successfully";
                        data['body'] = tempRes//encryptData(JSON.stringify(tempRes));
                        // data['tempRes'] = tempRes//encryptData(JSON.stringify(tempRes));
                        dbFunc.connectionRelease;
                        result(data);
                    }
                })
        }

    });

}

Admin.allTransactions = function (userData, result) {
    var data = {};

    if (userData.page == '') {
        var startNum = 0;
        var LimitNum = 50;
    } else {
        var startNum = parseInt(userData.page) * 0;
        var LimitNum = 50;
    }
    let filter = '';
    if (userData.start_date && userData.end_date) {
        filter = `bp.crdate between '${userData.start_date}' and '${userData.end_date}' and`;
    }
    if (userData.start_date == 'undefined' || userData.end_date == 'undefined') {
        filter = ''
    }

    let filter1 = '';
    if (userData.payment_status) {
        if (userData.payment_status == 'success') {
            filter1 = "payment_status = '1' and";
        }
        if (userData.payment_status == 'pending') {
            filter1 = "payment_status = '0' and";
        }
        if (userData.payment_status == 'canceled') {
            filter1 = "payment_status= '2' and";
        }
        if (userData.payment_status == 'all') {
            filter1 = "";
        }
    }
    //  console.log("filter", filter, userData);
    var totalPage = 0;
    var currentPage = 0;

    var order_type = '';
    if (userData.typeUser) {
        if (userData.typeUser == 0) {
            order_type = `order_type IN ('invest', 'deposit', 'unlocked') and`
        }
        if (userData.typeUser == 1) {
            order_type = `order_type = 'invest' and`
        }
        if (userData.typeUser == 2) {
            order_type = `order_type = 'deposit' and`
        }
        if (userData.typeUser == 3) {
            order_type = `order_type ='unlocked' and`
        }
    }

    var searchStr = '';
    if (userData.searchStr) {
        var searchStr = "( uu.username like '%" + userData.searchStr + "%') or ( uu.email like '%" + userData.searchStr + "%') and";
        if (userData.searchStr == '') {
            var searchStr = '';
        }
    }

    let query = `select uu.email,gp.*, uu.username,uu.profile_picture,uu.id from gb_payment_history as gp LEFT JOIN users as uu on uu.id=gp.user_id where ${filter1}  ${filter}  ${searchStr} ${order_type}  uu.is_deleted='0'  order by gp.crdate desc limit ? OFFSET ?`

    console.log("query----------->>>>>>>", query);
    sql.query("Select count(*) as totalPage from gb_payment_history order by id desc", [userData.userID], function (err, pageRec) {
        var totalPage = 0;
        var currentPage = 0;
        if (pageRec.length > 0) {
            totalPage = Math.ceil(pageRec[0].totalPage / LimitNum);
            console.log('totalPage', totalPage, pageRec[0].totalPage)
            currentPage = parseInt(userData.page);
            console.log("...................", pageRec);
        }

        sql.query(query, [LimitNum, startNum], function (error, res) {
            if (error) {
                data['err'] = true;
                data['msg'] = error.code;
                data['body'] = [error];
                result(null, data);
            } else {
                if (currentPage <= totalPage) {
                    data['err'] = false;
                    data['msg'] = "Data fetch successfully";
                    data['body'] = res;
                    data['totalPage'] = totalPage;
                    data['currentPage'] = currentPage;
                    result(null, data);
                } else {
                    data['err'] = true;
                    data['msg'] = "Data not found";
                    data['body'] = [];
                    result(null, data);
                }
            }
        })
    })
}
const saltRounds = 10;
Admin.withdrawal = function (userreq, result) {
    console.log("reqqqqqqqqqqqqqqqqqqqqqqqqqq", userreq.deduction_amount, userreq);
    var data = {}
    var invoice = uuid();
    var taxApply = (userreq.amount * 10) / 100;
    var deductAmount = userreq.amount - taxApply;
    console.log("dedddddddddddddddddddddddddd", deductAmount);
    var ciphertext = encryptData(userreq.address);
    const insertData = {
        amount: userreq.amount,
        user_id: userreq.id,
        invoice_id: invoice,
        bit_address: ciphertext,
        payment_status: '0',
        deduction_amount: userreq.deduction_amount,
        final_withdrawal_amount: userreq.final_withdrawal_amount,
        fee: userreq.fee,
        reinvested_amount: userreq.reinvested_amount
    }
    if (userreq.deduction_amount === deductAmount) {
        sql.query("select email,first_name,email_confirm from users where id=?", [userreq.id], (err, response) => {
            if (err) {
                data['err'] = true;
                data['msg'] = err.code;
                data['body'] = [err];
                result(null, data);
            } else {
                sql.query("insert into gb_v2_wth set ?", [insertData], function (error, res) {
                    if (error) {
                        data['err'] = true;
                        data['msg'] = error.code;
                        data['body'] = [error];
                        result(null, data);
                    } else {
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
                                mailData.email = response[0].email;
                                mailData.username = response[0].first_name;
                                mailData.invoice_id = invoice//cryptrInvoice.encryptData(response[0].invoice_id);
                                mailData.amount = response[0].amount;
                                mailData.message = tempres[0].template_body;
                                mailData.subject = tempres[0].template_subject;
                                // mailData.address = decryptData(response[0].bit_address);
                                mailData.user_id = userreq.id;
                                // mailData.confirmation_code = confirmation_code;

                                withdrawConfimationMail(mailData, res1 => {
                                    console.log(res1);
                                });
                            }
                        })

                        data['err'] = false;
                        data['msg'] = "Request generated successfully";
                        data['body'] = []//encryptData(JSON.stringify(res));//res;
                        result(null, data);
                    }
                })
            }
        })

    } else {
        data['err'] = true;
        data['msg'] = "Entered data wrong";
        data['body'] = [];
        result(null, data);
    }
}

function withdrawConfimationMail(argument, res1) {
    const sgMail = require('@sendgrid/mail');
    //sgMail.setApiKey('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');

    console.log("<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>", SEND_GRID_KEY);
    sgMail.setApiKey(SEND_GRID_KEY);
    if (argument.email) {
        var username = argument.username;//dog/gi;timeLeft
        var message = argument.message;
        console.log('sentMail', FROM_EMAIL);
        message = message.replace('[username]', username);
        message = message.replace('[amount]', argument.amount);
        // message = message.replace('[address]', argument.address);
        message = message.replace('[amount]', argument.amount);
        message = message.replace('[amount]', argument.amount);
        // message = message.replace('[confirmation_code]', argument.confirmation_code);

        let messageBodyJson = message
        const recordData = { user_id: argument.user_id, mail_title: 'Withdrawal Confirmation', mail_body: messageBodyJson }
        // sql.query("INSERT INTO bitomatic_withdraw_mailsent SET ?", [recordData], (error, inserted) => {
        // 	if (error) {
        // 		console.log(error);
        // 	} else {
        // 		console.log("inserted")
        // 	}
        // })
        console.log("argument_________email_with", argument.email);
        const msg = {
            to: "vishal.ktrickywebsolutions@gmail.com",//argument.email,
            // bcc: resndEmail ? WITHDRAWAL_EMAIL : "",
            from: `KUBERA <${FROM_EMAIL}>`,
            subject: argument.subject,
            html: messageBodyJson
        };

        // console.log("<<<<<<<email-msg>>>>>>>>>", msg)
        sgMail.send(msg).then((res) => {

            console.log("............success", res);
            res1(res);
        }).catch(err => {
            console.log(".............failed", err);
            res1(err);
        });

    } else {
        console.log("Please provide the emailID", argument);
    }
}

Admin.approval = function (param, result) {
    var data = {};
    console.log("gcfhgfvhggvj", param);
    const userData = param.id
    sql.query("UPDATE `gb_v2_wth` SET `payment_status`='1',`transactionHash`=? WHERE payment_status='0' and invoice_id IN(?) ", [userData.transactionHash, userData.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = "Request generated successfully";
            data['body'] = res;
            result(null, data);
        }

    })
}

Admin.getWithdrawalData = function (param, result) {
    var data = {};
    console.log(">>>>>>>>>>>>>", param);
    sql.query("select * from gb_v2_wth where user_id=? order by crdate desc", [param.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = 'Data fetch successfully';
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}

Admin.allWithdrawalData = function (param, result) {
    var data = {};
    console.log(">>>>>>>>>>>>>", param);
    sql.query("SELECT gv.*,us.user_id,us.wallet_address FROM `gb_v2_wth` as gv left join user as us on gv.user_id=us.user_id order by gv.crdate desc", function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = 'Data fetch successfully';
            var allData = res[0];
            data['body'] = encryptData(JSON.stringify(res))//CryptoJS.AES.encrypt(JSON.stringify(allData), Crykey.cryptoKey).toString();//res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
Admin.lastWithdrawal = function (userreq, result) {
    var data = {}
    sql.query("select sum(amount) as amount,MONTHNAME(crdate) as month_name,YEAR(crdate)as year from gb_v2_wth where user_id=? and YEAR(crdate)=? GROUP BY month(crdate)", [userreq.id, userreq.year], function (error, res1) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            result(null, data);
        } else {
            const finalResult = months.map(item => {
                const foundedData = res1.filter(val => val.month_name == item)

                if (foundedData.length > 0) {
                    return foundedData[0]
                } else {
                    return {

                        "month_name": item,
                        "amount": 0
                    }
                }
            })

            data['err'] = false;
            data['msg'] = "Request generated successfully";
            data['body'] = finalResult;
            result(null, data);
        }
    })
}

Admin.bonusHistory = function (param, result) {
    var data = {};
    sql.query("Select *,'Daily Bonus' AS `newType` from gb_daily_bonus where user_id=? order by crdate desc", [param.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            sql.query("Select *,'Direct Bonus' AS `newType` from gb_bonus_direct where user_id=? order by crdate desc", [param.id], function (error, res1) {
                if (error) {
                    data['err'] = true;
                    data['msg'] = error.code;
                    data['body'] = [error];
                    dbFunc.connectionRelease;
                    result(null, data);
                } else {
                    sql.query("Select *,'Indirect Bonus' AS `newType`  from gb_bonus_indirect where user_id=? order by crdate desc", [param.id], function (error, res2) {
                        if (error) {
                            data['err'] = true;
                            data['msg'] = error.code;
                            data['body'] = [error];
                            dbFunc.connectionRelease;
                            result(null, data);
                        } else {
                            const finalResult = {
                                dailyBonus: res,
                                directBonus: res1,
                                indirectBonus: res2
                            }
                            data['err'] = false;
                            data['msg'] = 'Data fetch successfully';
                            data['body'] = finalResult;
                            dbFunc.connectionRelease;
                            result(null, data);
                        }
                    })
                }
            })
        }
    })
}

Admin.addMarketTools = function (param, result) {
    const data = {}
    const insertData = {
        name: param.name,
        description: param.description,
        url: param.url
    }

    sql.query("insert into market_tool set ? ", [insertData], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = "data added successfully";
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}

Admin.getMarketTools = function (param, result) {
    var data = {};
    console.log(">>>>>>>>>>>>>", param);
    sql.query("select * from market_tool where is_deleted='0' ", function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = 'Data fetch successfully';
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}

Admin.delMarketTools = function (param, result) {
    const data = {}

    sql.query("update market_tool set is_deleted='1' where id=? ", [param.id], function (error, res) {
        if (error) {
            data['err'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            dbFunc.connectionRelease;
            result(null, data);
        } else {
            data['err'] = false;
            data['msg'] = "data deleted successfully";
            data['body'] = res;
            dbFunc.connectionRelease;
            result(null, data);
        }
    })
}
module.exports = Admin;