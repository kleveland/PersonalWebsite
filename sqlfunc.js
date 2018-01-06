module.exports = {
    reInitSections: function (conn, menu, cb) {
        conn.query('SELECT * FROM sections', function (err, res, fields) {
            for (let i = 0; i < res.length; i++) {
                menu.name[i] = res[i].Name;
                menu.short[i] = res[i].shorthand;
                menu.type[i] = res[i].Type;
                menu.id[i] = res[i].SID;
                menu.bg[i] = res[i].bgcolor;
            }

            let secname = '';

            for (let i = 0; i < menu.name.length; i++) {
                secname = getType(menu.type[i]);
                conn.query('SELECT * FROM ' + secname + ' WHERE SID="' + menu.id[i] + '"', function (err, res, fields) {
                    menu.dat[i] = res[0];
                    if (i == menu.name.length - 1) {
                        cb();
                    }
                })
            }

            //console.log(menu);

        })
    },

    insertUser: function (conn, googinf, cb) {
        //conn.connect();
        let vals = "'" + googinf.emails[0].value + "', '" + googinf.displayName + "', '" + googinf.id + "', " + 4;
        console.log(vals);
        conn.query('INSERT INTO users (Email, dispName, GID, GroupID) VALUES (' + vals + ')', function (err, res, fields) {
            console.log(res);
            if (err) throw err;
            conn.query('SELECT * FROM users WHERE UserID = ' + res.insertId, function (err, res, fields) {
                //conn.end();
                cb(res[0]);
            })

        })
    },

    findUser: function (conn, googinf, cb) {
        //conn.connect();
        conn.query('SELECT * FROM users WHERE GID = ' + googinf.id, function (err, res, fields) {
            //conn.end();
            if (res.length != 1) {
                cb(-1);
            } else {
                cb(res[0]);
            }
        });
    },

    findCreateUser: function (conn, googinf, cb) {
        //conn.connect();
        this.findUser(conn, googinf, (res) => {
            if (res == -1) {
                this.insertUser(conn, googinf, (res2) => {
                    //conn.end();
                    cb(res2);
                })
            } else {
                //conn.end();
                cb(res);
            }
        })
    },

    isAdmin: function (conn, userid, groupid, cb) {
        conn.query('SELECT Admin FROM users INNER JOIN groups ON users.GroupID = groups.GroupID WHERE users.UserID = ' + userid, function (err, res, fields) {
            if (err) throw err;
            console.log(res[0].Admin);
            if (res[0].Admin == true) {
                console.log("admin");
                cb(true);
            } else {
                console.log("user");
                cb(false);
            }
        })
    },

    deleteSection: function (conn, type, sid, cb) {
        let secname = getType(type);

        conn.query('DELETE FROM ' + secname + ' WHERE SID = ' + sid, function (err, res, fields) {
            if (err) throw err;
            conn.query('DELETE FROM sections WHERE SID = ' + sid, function (err, res, fields) {
                if(err) throw err;
                console.log(sid + " section deleted.");
                cb();
            })
        })
    },

    updateSection: function (conn, body, cb) {
        let sec = getType(body.type);
        let fieldstr = '';
        let keys = Object.keys(body);


        for (let i = 2; i < keys.length - 1; i++) {
            fieldstr = fieldstr + keys[i] + '=' + "'" + body[keys[i]] + "'";
            if (i != keys.length - 2) {
                fieldstr = fieldstr + ", ";
            }
        }

        console.log("TEST")
        console.log("Objectkeys", Object.keys(body))
        console.log("!", sec, " ", fieldstr);
        console.log('UPDATE sections SET bgcolor="' + body.bgcolor + '" WHERE SID = ' + body.id);
        conn.query("UPDATE sections SET bgcolor='" + body.bgcolor + "' WHERE SID = " + body.id, function (err, res, fields) {
            if (err) throw err;
            console.log("GOT HERE");
            conn.query('UPDATE ' + sec + ' SET ' + fieldstr + ' WHERE SID = ' + body.id, function (err, res, fields) {
                if (err) throw err;
                cb();
            })
        });
    },

    insertSection: function (conn, body, cb) {
        let vals = "'" + body.name + "', '" + body.shorthand + "', '" + body.type + "'";
        conn.query('INSERT INTO sections (Name, shorthand, Type) VALUES (' + vals + ')', function (err, res, fields) {
            if (err) throw err;
            let type = getType(body.type);
            conn.query('INSERT INTO ' + type + ' (SID) VALUES (' + res.insertId + ')', function (err, res, fields) {
                console.log("Inserted section", type);
                cb(res[0]);
            })

        })
    }
}

function getType(type) {
    switch (type) {
        case '0':
        case 0:
            return 'sec_intro'
            break;
        case '1':
        case 1:
            return 'sec_descrip'
            break;
        case '2':
        case 2:
            return 'sec_list'
            break;
    }
}
