module.exports = {

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
    }
}
