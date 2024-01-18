var sql = require('../model/db');
var dbFunc = require('./db-function');
var { v4: uuid } = require('uuid');

const submitticket = function (data) {
    this.created_at = data.created_at;
}

submitticket.submittickets = function (param, result) {
    var data = {};
    var actParam = param;
    sql.query("Select * from users WHERE id = ?", [param.userID], function (err, ress) {
        if (err) {
            console.log("error: ", err);
            dbFunc.connectionRelease;
            result(null, err);
        } else {
            if (ress.length != 0) {
                sql.query("Select * from submit_ticket WHERE user_id =? and status='1' ", [param.userID], function (err, res) {
                    if (err) {
                        console.log("error: ", err);
                        dbFunc.connectionRelease;
                        result(null, err);
                    }
                    else {
                        console.log("hhhhhhhhhhhhhhhhhhhhhhhhhh");
                        if (res.length == 0) {
                            const ticketId = uuid();
                            sql.query("INSERT INTO `submit_ticket`(`id`,`user_id`,`email`,`subject`, `description`,`status` ) value (?,?,?,?,?,'1')", [ticketId, param.userID, param.email, param.subject, param.description], function (err, rows1) {

                                if (err) {
                                    console.log("error: ", err);
                                    data['error'] = true;
                                    data['msg'] = err.Error;
                                    data['body'] = [];
                                    dbFunc.connectionRelease;
                                    result(null, data);
                                }
                                else {

                                    data['error'] = false;
                                    data['msg'] = 'Thank you for generating a ticket, We will get back to you in 24 to 48 hours.';
                                    data['body'] = [];
                                    dbFunc.connectionRelease;
                                    result(null, data);

                                }
                            });
                        } else {
                            data['error'] = true;
                            data['msg'] = 'You already have an active support ticket';
                            data['body'] = [];
                            dbFunc.connectionRelease;
                            result(null, data);


                        }


                    }
                });
            } else {
                data['error'] = true;
                data['msg'] = 'User Not Found';
                data['body'] = [];
                dbFunc.connectionRelease;
                result(null, data);


            }
        }
    });
}

submitticket.getTickets = function (req, result) {
    var data = {};

    var userData = req.query;

    var searchStr = '';
    var filter = '';
    if (userData.searchStr) {
        var searchStr = "( st.email like '" + userData.searchStr + "%') or ( st.subject like '" + userData.searchStr + "%') or ( st.description like '" + userData.searchStr + "%') and";
        if (userData.searchStr == '') {
            var searchStr = '';
        }
    }
    if (userData.status) {
        if (userData.status == 'open') {
            filter = "status = '1' and";
        }
        if (userData.status == 'close') {
            filter = "status = '0' and";
        }
        if (userData.typeUser == 'all') {
            filter = "";
        }
    }

    if (userData.user_id) {
        var sqlQ = "Select st.id as id,st.status,u.id as user_id, u.username as user_name,u.first_name, st.email as email, st.subject as subject , st.issue as issue, st.description as description, st.attachment as attachment, st.created_at as created_at, st.status as status from submit_ticket st Inner Join users u  ON  st.user_id=u.id where " + searchStr + " " + filter + " user_id=? order by st.created_at desc";
        // var sqlQ = "Select st.id as id,u.id as user_id, u.username as user_name, st.email as email, st.subject as subject , st.issue as issue, st.description as description, st.attachment as attachment, st.created_at as created_at, st.status as status from submit_ticket st Inner Join users u  ON  st.user_id=u.id where " + searchStr + " " + filter + " user_id=" + reqUserId + " GROUP BY st.subject order by st.created_at desc";
    } else {
        var sqlQ = "Select st.id as id,st.status,u.id as user_id, u.username as user_name,u.first_name, st.email as email, st.subject as subject , st.issue as issue, st.description as description, st.attachment as attachment, st.created_at as created_at, st.status as status from submit_ticket st Inner Join users u  ON  st.user_id=u.id WHERE " + searchStr + " " + filter + " st.email IS NOT NULL order by st.created_at desc";
        // var sqlQ = "Select st.id as id,u.id as user_id, u.username as user_name, st.email as email, st.subject as subject , st.issue as issue, st.description as description, st.attachment as attachment, st.created_at as created_at, st.status as status from submit_ticket st Inner Join users u  ON  st.user_id=u.id WHERE " + searchStr + " " + filter + " st.email IS NOT NULL  GROUP BY st.subject order by st.created_at desc";
    }


    sql.query(sqlQ, [userData.user_id], function (err, res) {
        if (err) {
            console.log(err);
            data['error'] = true;
            data['msg'] = err.code;
            data['body'] = [];
            dbFunc.connectionRelease;

            result(null, data);
        }
        else {
            if (res != 0) {
                data['error'] = false;
                data['msg'] = "Success";
                data['body'] = res//encryptData(JSON.stringify(res));
                dbFunc.connectionRelease;
                result(null, data);
            } else {
                data['error'] = false;
                data['msg'] = "No Tickets Found";
                data['body'] = [];
                dbFunc.connectionRelease;
                result(null, data);
            }

        }

    });
}

submitticket.addTicketComment = function (postData, result) {
    var data = {};
    // sql.query("INSERT INTO `ticket_comments`(`ticket_id`,`user_id`,`comment_msg`, `attachment`) value (?,?,?,?)", [postData.ticket_id, postData.user_id, postData.comment_msg, postData.attachment], function (err, res) {
    let query = `INSERT INTO ticket_comments(ticket_id,user_id,comment_msg) value (?,?,?)`;
    sql.query(query, [postData.ticket_id, postData.user_id, postData.comment_msg], function (err, res) {
        if (err) {
            console.log(err);
            data['error'] = true;
            data['msg'] = err.code;
            data['body'] = [];
            dbFunc.connectionRelease;
            result(null, data);
        }
        else {
            data['error'] = false;
            data['msg'] = 'Comment Submitted Successfully';
            data['body'] = postData;
            dbFunc.connectionRelease;
            result(null, data);
        }

    });
}


submitticket.getTicketById = function (userData, result) {
    var data = {};

    var sqlQ = "Select st.id as id,st.status,u.id as user_id, u.username as user_name,u.first_name, st.email as email, st.subject as subject , st.issue as issue, st.description as description, st.attachment as attachment, st.created_at as created_at, st.status as status from submit_ticket st Inner Join users u  ON  st.user_id=u.id where  user_id=? order by st.created_at desc";
    // var sqlQ = "Select st.id as id,u.id as user_id, u.username as user_name, st.email as email, st.subject as subject , st.issue as issue, st.description as description, st.attachment as attachment, st.created_at as created_at, st.status as status from submit_ticket st Inner Join users u  ON  st.user_id=u.id where " + searchStr + " " + filter + " user_id=" + reqUserId + " GROUP BY st.subject order by st.created_at desc";

    sql.query(sqlQ, [userData.userID], function (err, res) {
        if (err) {
            console.log(err);
            data['error'] = true;
            data['msg'] = err.code;
            data['body'] = [];
            dbFunc.connectionRelease;

            result(null, data);
        }
        else {
            if (res != 0) {
                data['error'] = false;
                data['msg'] = "Success";
                data['body'] = res//encryptData(JSON.stringify(res));
                dbFunc.connectionRelease;
                result(null, data);
            } else {
                data['error'] = false;
                data['msg'] = "No Tickets Found";
                data['body'] = [];
                dbFunc.connectionRelease;
                result(null, data);
            }

        }

    });
}

submitticket.updateTicketStatus = function (param, result) {
    const data = {}
    const post = {}
    var id = param.ticket_id
    var act = 1
    sql.query("select * from submit_ticket WHERE status= '1'  and id= ?", [id], function (err, res) {
        if (res.length > 0) {
            const actId = res[0].id;
            act = (res[0].status == 0) ? '1' : '0';
            post.status = act;
            sql.query("UPDATE submit_ticket SET `status` = ? where id=? ", [act, actId], function (err, update) {
                if (err) {
                    data['error'] = true;
                    data['msg'] = err.code;
                    data['body'] = [err];
                    result(null, data);
                } else {
                    data['error'] = false;
                    data['msg'] = "status changed successfully";
                    data['body'] = update;
                    result(null, data);
                }
            })
        } else {

            data['error'] = true;
            data['msg'] = 'no record found';
            data['body'] = [];
            result(null, data);
        }

    })

}

submitticket.getCommentData = function (param, result) {
    const data = {}
    const post = {}
    var id = param.ticket_id
    var act = 1
    sql.query("select * from  ticket_comments WHERE ticket_id= ?", [id], function (err, res) {

        if (err) {
            data['error'] = true;
            data['msg'] = err.code;
            data['body'] = [err];
            result(null, data);
        } else {
            data['error'] = false;
            data['msg'] = "status changed successfully";
            data['body'] = res;
            result(null, data);
        }
    })
}

module.exports = submitticket;