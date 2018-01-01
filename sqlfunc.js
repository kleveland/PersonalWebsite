module.exports = {
    reInitSections: function(conn, menu) {
        conn.query('SELECT * FROM sections', function (err, res, fields) {
            for (let i = 0; i < res.length; i++) {
                menu.name[i] = res[i].Name;
                menu.short[i] = res[i].shorthand;
                menu.type[i] = res[i].Type;
                menu.id[i] = res[i].SID;
            }

            let secname = '';

            for (let i = 0; i < menu.name.length; i++) {
                switch (menu.type[i]) {
                    case 0:
                        secname = 'sec_intro'
                        break;
                    case 1:
                        secname = 'sec_descrip'
                        break;
                    case 2:
                        secname = 'sec_list'
                        break;
                }
                conn.query('SELECT * FROM ' + secname + ' WHERE SID="' + menu.id[i] + '"', function (err, res, fields) {
                    menu.dat[i] = res[0];
                    //console.log('tester',menu.dat[i].SID);
                })
            }

            //console.log(menu);

        })
    },

    insertUser: function(conn, googinf, cb) {
        //conn.connect();
        let vals = "'" + googinf.emails[0].value + "', '" + googinf.displayName + "', '" + googinf.id + "', " + 4;
        console.log(vals);
        conn.query('INSERT INTO users (Email, dispName, GID, GroupID) VALUES (' + vals + ')', function(err, res, fields) {
            console.log(res);
            if(err) throw err;
            conn.query('SELECT * FROM users WHERE UserID = ' + res.insertId, function(err, res, fields) {
                //conn.end();
                cb(res[0]);
            })

        })
    },

    findUser: function(conn, googinf, cb) {
        //conn.connect();
        conn.query('SELECT * FROM users WHERE GID = ' + googinf.id, function(err, res, fields) {
            //conn.end();
           if(res.length != 1) {
               cb(-1);
           } else {
               cb(res[0]);
           }
        });
    },

    findCreateUser: function (conn, googinf, cb) {
        //conn.connect();
        this.findUser(conn,googinf,(res) => {
            if(res == -1) {
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

    isAdmin: function(conn, userid, groupid, cb) {
        conn.query('SELECT Admin FROM users INNER JOIN groups ON users.GroupID = groups.GroupID WHERE users.UserID = ' + userid, function(err, res, fields) {
            if(err) throw err;
            console.log(res[0].Admin);
            if(res[0].Admin == true) {
                console.log("admin");
                cb(true);
            } else {
                console.log("user");
                cb(false);
            }
        })
    },

    updateSection: function(conn, body, cb) {
        let sec = '';
        let fieldstr = '';
        let keys = Object.keys(body);
        switch(body.type) {
            case '0':
                sec = 'sec_intro'
                break;
            case '1':
                sec = 'sec_descrip'
                break;
            case '2':
                sec = 'sec_list'
                break;
        }

        for(let i=2; i < keys.length; i++) {
            fieldstr = fieldstr + keys[i] + '=' + "'" + body[keys[i]] + "'";
            if(i != keys.length-1) {
                fieldstr = fieldstr + ", ";
            }
        }

        console.log("TEST")
        console.log("Objectkeys", Object.keys(body))
        console.log("!",sec," ", fieldstr);
        conn.query('UPDATE ' + sec + ' SET ' + fieldstr + ' WHERE SID = ' + body.id, function(err, res, fields) {
            if(err) throw err;
            cb();
        })
    }
}
