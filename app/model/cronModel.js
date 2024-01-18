const sql = require('./db');
var { v4: uuid } = require('uuid');
const moment = require('moment');
var dbFunc = require('./db-function');

const Cron = function (data) {
    this.first_name = data.first_name;
    this.created_at = data.created_at;
}

Cron.giveDailyBonus = function (orderData, result) {
    let data = {}
    const today = moment().format('YYYY-MM-DD');
    // console.log("today>>>>>>>>>>>>>>>>>>>>", today);
    // let query = `SELECT up.*,(SELECT sponsor_id from users where users.id=up.user_id) as sponsor_id from user_pool as up WHERE up.is_closed='0' and up.created_at<=?`
    let query = `SELECT up.*,(SELECT sponsor_id from users where users.id=up.user_id) as sponsor_id,(SELECT level from users where users.id=up.user_id) as user_level from user_pool as up WHERE up.is_closed='0' and date(up.created_at)<=?`
    sql.query(query, [today], (error, rows) => {
        if (error) {
            console.log(">>>>>>>>>>>>error1", error)
            dbFunc.connectionRelease;
            data['error'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            result(null, data);
        } else {
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>", rows);
            grantDailyBonus(rows);
            grantDirectDailyBonus(rows, (res) => {
                propertyIndirectBonus(rows, (res1) => {
                    data['error'] = false;
                    data['msg'] = "Success";
                    data['body'] = [];
                    result(null, data)
                })
            });
        }
    })
}

function grantDailyBonus(rows) {
    const result = rows.map(item => {
        let bonus = item.daily_return;
        let level = item.pool;
        const lvlBonus = bonus;
        return [
            item.user_id,
            item.order_id,
            'KBR',
            lvlBonus,
            '1',
            level,
            item.investment_amount,
            item.percentage
        ]
    })
    console.log("result........................................", result);
    sql.query("INSERT INTO gb_daily_bonus (user_id,order_id,coin,bonus,distribute,level,baseBTCAmount,percentage) values ?", [result], (error, rows, fields) => {
        if (error) {
            console.log(">>>>>>>>>>>>error2", error)
            dbFunc.connectionRelease;
            // return false;
        } else {
            console.log("gbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", rows);
            dbFunc.connectionRelease;
            // return true;
        }
    })
    return true;
}

function grantDirectDailyBonus(data, callback) {
    sql.query("SELECT affiliate_earnings from token WHERE level=1", (error, tokenData) => {
        if (error) {
            console.log(">>>>>>>>>>>>error3", error)
            dbFunc.connectionRelease;
            callback(error);
        } else {
            const insertedData = data.map(item => {
                let bonus = item.daily_return;
                let level = item.user_level

                // let lvlSponsorBonus = bonus;
                var percentage = tokenData[0].affiliate_earnings
                const directBonus = item.investment_amount * percentage / 100;
                return [
                    item.sponsor_id,
                    item.user_id,
                    item.order_id,
                    'KBR',
                    directBonus,
                    '0',
                    1,
                    item.investment_amount,
                    level,
                    percentage
                ]
            })
            console.log("<<<<<<<<<<<<<<records>>>>>>>>>>>>>>>>>", insertedData)
            sql.query("INSERT INTO gb_bonus_direct (user_id,from_id,order_id,coin,bonus,distribute,level,baseBTCAmount,bit_level,percentage) values ?", [insertedData], (error, rows, fields) => {
                if (error) {
                    console.log(">>>>>>>>>>>>error4", error)
                    data['body'] = [error];
                    dbFunc.connectionRelease;
                    callback(error);
                } else {

                    dbFunc.connectionRelease;
                    callback(insertedData);

                }
            })
        }
    })

}
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
Cron.earningGraph = function (userData, result) {
    var data = {}
    console.log("userData..................userData..............userData", userData);
    sql.query("SELECT user_id,MONTHNAME(crdate) as month_name,YEAR(crdate)as year,sum(bonus) as daily_bonus FROM `gb_daily_bonus` WHERE date(crdate) BETWEEN '2021-11-01' and CURRENT_DATE and user_id = ? and YEAR(crdate)=? GROUP BY month(crdate)", [userData.id, userData.year], function (error, res) {
        if (error) {
            console.log(">>>>>>>>>>>>error5", error)
            data['error'] = true;
            data['msg'] = error.code;
            data['body'] = [error];
            result(null, data);
        } else {
            console.log("<<>res..................res...............res>><<>>rrr", res);

            if (res.length > 0) {
                sql.query(`SELECT COALESCE(SUM(bonus),0.00) as directbonus, MONTHNAME(crdate) as month_name,YEAR(crdate)as year,crdate ,(SELECT COALESCE(SUM(bonus),0.00) as indirectBonus from gb_bonus_indirect where gb_bonus_indirect.user_id = gb_bonus_direct.user_id ) as indirectBonus FROM gb_bonus_direct WHERE date(crdate) BETWEEN '2021 - 11 - 01' and CURRENT_DATE and user_id = ? and YEAR(crdate)=? GROUP BY month(crdate)`, [userData.id, userData.year], function (error, res1) {
                    if (error) {
                        console.log(">>>>>>>>>>>>error6", error)
                        data['error'] = true;
                        data['msg'] = error.code;
                        data['body'] = [error];
                        result(null, data);
                    } else {
                        console.log("<<>res1..................res1...............res1>><<>>rrr", res1);

                        const finalResultInvest = months.map(item => {
                            const foundedData = res.filter(val => val.month_name == item)
                            console.log("_________________foundedData_________________", foundedData.length);
                            if (foundedData.length > 0) {
                                return foundedData[0]
                            } else {
                                return {
                                    "user_id": userData.id,
                                    "month_name": item,
                                    "daily_bonus": 0
                                }
                            }
                        })
                        console.log("finalResultInvest", finalResultInvest)
                        // finalResultInvest[0].amount_in_usd.toFixed(2);

                        const finalResultBonus = months.map(item => {
                            const foundedData1 = res1.filter(val => val.month_name == item)

                            if (foundedData1.length > 0) {
                                console.log(" foundedData1[0]", foundedData1[0])
                                foundedData1[0].bonus = (foundedData1[0].directbonus + foundedData1[0].indirectBonus).toFixed(2);//Number(Number(foundedData1[0].bonus).toFixed(2));
                                return foundedData1[0]
                            } else {
                                return {
                                    "user_id": userData.id,
                                    "month_name": item,
                                    "bonus": 0
                                }
                            }
                        })

                        data['error'] = false;
                        data['msg'] = "Success";
                        data['body'] = [{
                            daily_bonus: finalResultInvest,
                            bonus: finalResultBonus
                        }];
                        dbFunc.connectionRelease;
                        result(null, data);
                    }

                })
            } else {
                const finalResultBonus1 = months.map(item => {
                    return {
                        "user_id": userData.id,
                        "month_name": item,
                        "bonus": 0
                    }
                })
                const finalResultInvest1 = months.map(item => {
                    return {
                        "user_id": userData.id,
                        "month_name": item,
                        "daily_bonus": 0
                    }
                })
                data['error'] = false;
                data['msg'] = "data";
                data['body'] = [{ bonus: finalResultBonus1, daily_bonus: finalResultInvest1 }];
                dbFunc.connectionRelease;
                result(null, data);
            }
        }
    })
}

const propertyIndirectBonus = (allInvestments, callback) => {
    newGrantIndirectDailyBonus(allInvestments, (response) => {
        if (response.length > 0) {
            sql.query("INSERT INTO gb_bonus_indirect (coin,distribute,user_id,user_id_origin,level,percentage,order_id,bonus,baseBTCAmount,bit_level) values ?", [response], (error, inserted) => {
                if (error) {
                    console.log(">>>>>>>>>>>>error7", error)
                    dbFunc.connectionRelease;
                    callback([])
                } else {
                    dbFunc.connectionRelease;
                    callback(response)
                }
            })
        } else {
            dbFunc.connectionRelease;
            callback([])
        }
    });
}

function newGrantIndirectDailyBonus(allInvestments, callback) {
    var coin = 'KBR';
    var lvlPer = [];
    let percentage = 0;
    sql.query("SELECT id,sponsor_id from users as us ORDER BY us.id", (error, allUsers) => {
        if (error) {
            console.log(">>>>>>>>>>>>error8", error)
            return false;
        } else {
            sql.query("SELECT *,affiliate_earnings as percentage from token", (error, lvlPerData) => {
                if (error) {
                    console.log(">>>>>>>>>>>>error9", error)
                    return false;
                } else {
                    let insertedData = []

                    allInvestments.map(item => {
                        var amount = item.investment_amount;

                        let levelOneUsersIndex = allUsers.findIndex(val => val.id == item.user_id);
                        if (levelOneUsersIndex != -1) {
                            levelOneUser = allUsers[levelOneUsersIndex];
                            var user_id = levelOneUser.sponsor_id
                            if (user_id != 0) {

                                //LEVEL 2
                                let levelTwoUserIndex = allUsers.findIndex(val => val.id == user_id)
                                if (levelTwoUserIndex != -1) {
                                    levelTwoUser = allUsers[levelTwoUserIndex];
                                    var user_id = levelTwoUser.sponsor_id
                                    if (user_id != 0) {
                                        console.log("user_id: ", user_id);
                                        lvlPer = lvlPerData.filter(item => item.level == 2);
                                        percentage = lvlPer.length > 0 ? lvlPer[0].percentage : 0
                                        var levelTwoBonus = amount * percentage / 100;
                                        let lvlSponsorBonus = amount
                                        var updateUserData = [
                                            coin,
                                            '1',
                                            user_id,
                                            item.user_id,
                                            2,
                                            percentage,
                                            item.order_id,
                                            levelTwoBonus,
                                            amount,
                                            2
                                        ]
                                        insertedData.push(updateUserData)
                                        //LEVEL 3
                                        let levelThreeUserIndex = allUsers.findIndex(val => val.id == user_id)
                                        if (levelThreeUserIndex != -1) {
                                            let levelThreeUser = allUsers[levelThreeUserIndex];
                                            var user_id = levelThreeUser.sponsor_id
                                            if (user_id != 0) {
                                                console.log("user_id: ", user_id);
                                                lvlPer = lvlPerData.filter(item => item.level == 3);
                                                percentage = lvlPer.length > 0 ? lvlPer[0].percentage : 0
                                                var levelThreeBonus = lvlSponsorBonus * percentage / 100;
                                                // console.log("<<<<<<<<<<<levelThreeBonus>>>>>>>>>>>>>>", levelThreeBonus);
                                                var updateUserData = [
                                                    coin,
                                                    '1',
                                                    user_id,
                                                    item.user_id,
                                                    3,
                                                    percentage,
                                                    item.order_id,
                                                    levelThreeBonus,
                                                    amount,
                                                    3
                                                ]
                                                insertedData.push(updateUserData)
                                                //LEVEL 4
                                                let levelFourUserIndex = allUsers.findIndex(val => val.id == user_id)
                                                if (levelFourUserIndex != -1) {
                                                    let levelFourUser = allUsers[levelFourUserIndex];
                                                    var user_id = levelFourUser.sponsor_id
                                                    if (user_id != 0) {
                                                        console.log("user_id: ", user_id);
                                                        lvlPer = lvlPerData.filter(item => item.level == 4);
                                                        percentage = lvlPer.length > 0 ? lvlPer[0].percentage : 0
                                                        var levelFourBonus = lvlSponsorBonus * percentage / 100;
                                                        // console.log("<<<<<<<<<<<levelFourBonus>>>>>>>>>>>>>>", levelFourBonus);
                                                        var updateUserData = [
                                                            coin,
                                                            '1',
                                                            user_id,
                                                            item.user_id,
                                                            4,
                                                            percentage,
                                                            item.order_id,
                                                            levelFourBonus,
                                                            amount,
                                                            4
                                                        ]
                                                        insertedData.push(updateUserData)
                                                        //LEVEL 5
                                                        let levelFiveUserIndex = allUsers.findIndex(val => val.id == user_id)
                                                        if (levelFiveUserIndex != -1) {
                                                            let levelFiveUser = allUsers[levelFiveUserIndex];
                                                            var user_id = levelFiveUser.sponsor_id
                                                            if (user_id != 0) {
                                                                console.log("user_id: ", user_id);
                                                                var bitLevel = 5
                                                                lvlPer = lvlPerData.filter(item => item.level == bitLevel);
                                                                percentage = lvlPer.length > 0 ? lvlPer[0].percentage : 0
                                                                var levelFiveBonus = lvlSponsorBonus * percentage / 100;
                                                                // console.log("<<<<<<<<<<<levelFiveBonus>>>>>>>>>>>>>>", levelFiveBonus);
                                                                var updateUserData = [
                                                                    coin,
                                                                    '1',
                                                                    user_id,
                                                                    item.user_id,
                                                                    bitLevel,
                                                                    percentage,
                                                                    item.order_id,
                                                                    levelFiveBonus,
                                                                    amount,
                                                                    5
                                                                ]
                                                                insertedData.push(updateUserData)

                                                                //LEVEL 6

                                                                let levelSixUserIndex = allUsers.findIndex(val => val.id == user_id)

                                                                if (levelSixUserIndex != -1) {
                                                                    levelSixUser = allUsers[levelSixUserIndex];
                                                                    var user_id = levelSixUser.sponsor_id
                                                                    if (user_id != 0) {
                                                                        console.log("user_id: ", user_id);
                                                                        var bitLevel = 6
                                                                        lvlPer = lvlPerData.filter(item => item.level == bitLevel);
                                                                        percentage = lvlPer.length > 0 ? lvlPer[0].percentage : 0
                                                                        var levelSixBonus = lvlSponsorBonus * percentage / 100;
                                                                        var updateUserData = [
                                                                            coin,
                                                                            '1',
                                                                            user_id,
                                                                            item.user_id,
                                                                            bitLevel,
                                                                            percentage,
                                                                            item.order_id,
                                                                            levelSixBonus,
                                                                            amount,
                                                                            6
                                                                        ]
                                                                        insertedData.push(updateUserData)
                                                                        //LEVEL 7

                                                                        let levelSevenUserIndex = allUsers.findIndex(val => val.id == user_id)
                                                                        if (levelSevenUserIndex != -1) {
                                                                            let levelSevenUser = allUsers[levelSevenUserIndex];
                                                                            var user_id = levelSevenUser.sponsor_id
                                                                            if (user_id != 0) {
                                                                                console.log("user_id: ", user_id);
                                                                                var bitLevel = 7
                                                                                lvlPer = lvlPerData.filter(item => item.level == bitLevel);
                                                                                percentage = lvlPer.length > 0 ? lvlPer[0].percentage : 0
                                                                                var levelSevenBonus = lvlSponsorBonus * percentage / 100;
                                                                                var updateUserData = [
                                                                                    coin,
                                                                                    '1',
                                                                                    user_id,
                                                                                    item.user_id,
                                                                                    bitLevel,
                                                                                    percentage,
                                                                                    item.order_id,
                                                                                    levelSevenBonus,
                                                                                    amount,
                                                                                    7
                                                                                ]
                                                                                insertedData.push(updateUserData)
                                                                                //LEVEL 8
                                                                                var bitLevel = 8
                                                                                let levelEightUserIndex = allUsers.findIndex(val => val.id == user_id)
                                                                                if (levelEightUserIndex != -1) {
                                                                                    let levelEightUser = allUsers[levelEightUserIndex];
                                                                                    var user_id = levelEightUser.sponsor_id
                                                                                    if (user_id != 0) {
                                                                                        console.log("user_id: ", user_id);
                                                                                        lvlPer = lvlPerData.filter(item => item.level == bitLevel);
                                                                                        percentage = lvlPer.length > 0 ? lvlPer[0].percentage : 0
                                                                                        var levelEightBonus = lvlSponsorBonus * percentage / 100;
                                                                                        var updateUserData = [
                                                                                            coin,
                                                                                            '1',
                                                                                            user_id,
                                                                                            item.user_id,
                                                                                            bitLevel,
                                                                                            percentage,
                                                                                            item.order_id,
                                                                                            levelEightBonus,
                                                                                            amount,
                                                                                            8
                                                                                        ]
                                                                                        insertedData.push(updateUserData)
                                                                                    }
                                                                                    //LEVEL 9
                                                                                    var bitLevel = 9
                                                                                    let levelNineUserIndex = allUsers.findIndex(val => val.id == user_id)
                                                                                    if (levelNineUserIndex != -1) {
                                                                                        let levelNineUser = allUsers[levelNineUserIndex];
                                                                                        var user_id = levelNineUser.sponsor_id
                                                                                        if (user_id != 0) {
                                                                                            console.log("user_id: ", user_id);
                                                                                            lvlPer = lvlPerData.filter(item => item.level == bitLevel);
                                                                                            percentage = lvlPer.length > 0 ? lvlPer[0].percentage : 0
                                                                                            var levelNineBonus = lvlSponsorBonus * percentage / 100;
                                                                                            var updateUserData = [
                                                                                                coin,
                                                                                                '1',
                                                                                                user_id,
                                                                                                item.user_id,
                                                                                                bitLevel,
                                                                                                percentage,
                                                                                                item.order_id,
                                                                                                levelNineBonus,
                                                                                                amount,
                                                                                                9
                                                                                            ]
                                                                                            insertedData.push(updateUserData)
                                                                                            //LEVEL 10
                                                                                            var bitLevel = 10
                                                                                            let levelTenUserIndex = allUsers.findIndex(val => val.id == user_id)
                                                                                            if (levelTenUserIndex != -1) {
                                                                                                let levelTenUser = allUsers[levelTenUserIndex];
                                                                                                var user_id = levelTenUser.sponsor_id
                                                                                                if (user_id != 0) {
                                                                                                    console.log("user_id: ", user_id);
                                                                                                    lvlPer = lvlPerData.filter(item => item.level == bitLevel);
                                                                                                    percentage = lvlPer.length > 0 ? lvlPer[0].percentage : 0
                                                                                                    var levelTenBonus = lvlSponsorBonus * percentage / 100;
                                                                                                    var updateUserData = [
                                                                                                        coin,
                                                                                                        '1',
                                                                                                        user_id,
                                                                                                        item.user_id,
                                                                                                        bitLevel,
                                                                                                        percentage,
                                                                                                        item.order_id,
                                                                                                        levelTenBonus,
                                                                                                        amount,
                                                                                                        10
                                                                                                    ]
                                                                                                    insertedData.push(updateUserData)
                                                                                                    //LEVEL 11
                                                                                                    var bitLevel = 11
                                                                                                    let levelElevenUserIndex = allUsers.findIndex(val => val.id == user_id)
                                                                                                    if (levelElevenUserIndex != -1) {
                                                                                                        let levelElevenUser = allUsers[levelElevenUserIndex];
                                                                                                        var user_id = levelElevenUser.sponsor_id
                                                                                                        if (user_id != 0) {
                                                                                                            console.log("user_id: ", user_id);
                                                                                                            lvlPer = lvlPerData.filter(item => item.level == bitLevel);
                                                                                                            percentage = lvlPer.length > 0 ? lvlPer[0].percentage : 0
                                                                                                            var levelElevenBonus = lvlSponsorBonus * percentage / 100;
                                                                                                            // console.log("<<<<<<<<<<<levelElevenBonus>>>>>>>>>>>>>>", levelElevenBonus);
                                                                                                            var updateUserData = [
                                                                                                                coin,
                                                                                                                '1',
                                                                                                                user_id,
                                                                                                                item.user_id,
                                                                                                                bitLevel,
                                                                                                                percentage,
                                                                                                                item.order_id,
                                                                                                                levelElevenBonus,
                                                                                                                amount,
                                                                                                                11
                                                                                                            ]
                                                                                                            insertedData.push(updateUserData)
                                                                                                            //LEVEL 12
                                                                                                            var bitLevel = 12
                                                                                                            let levelTwelveUserIndex = allUsers.findIndex(val => val.id == user_id)
                                                                                                            if (levelTwelveUserIndex != -1) {
                                                                                                                let levelTwelveUser = allUsers[levelTwelveUserIndex];
                                                                                                                var user_id = levelTwelveUser.sponsor_id
                                                                                                                if (user_id != 0) {
                                                                                                                    console.log("user_id: ", user_id);
                                                                                                                    lvlPer = lvlPerData.filter(item => item.level == bitLevel);
                                                                                                                    percentage = lvlPer.length > 0 ? lvlPer[0].percentage : 0
                                                                                                                    var levelTwelveBonus = lvlSponsorBonus * percentage / 100;
                                                                                                                    // console.log("<<<<<<<<<<<levelTwelveBonus>>>>>>>>>>>>>>", levelTwelveBonus);
                                                                                                                    var updateUserData = [
                                                                                                                        coin,
                                                                                                                        '1',
                                                                                                                        user_id,
                                                                                                                        item.user_id,
                                                                                                                        bitLevel,
                                                                                                                        percentage,
                                                                                                                        item.order_id,
                                                                                                                        levelTwelveBonus,
                                                                                                                        amount,
                                                                                                                        12
                                                                                                                    ]
                                                                                                                    insertedData.push(updateUserData)
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    })

                    return callback(insertedData)

                }
            })
        }
    })
}

module.exports = Cron;