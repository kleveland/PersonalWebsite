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
                    menu.dat[i] = Object.assign({}, res[0]);
                    if (menu.type[i] == 2) {
                        console.log(menu.dat[i])
                        getSlides(conn, menu.dat[i].id, (slides) => {
                            menu.dat[i].dat = slides;

                            console.log('TESTDAT', menu.dat[i], menu.bg[i])
                        })
                    }
                    /*console.log(res[0]);
                    let keys = Object.keys(res[0]);
                    console.log(keys);
                    for(let i=2; i<keys.length; i++) {
                        res[0][keys[i]] = parser(res[0][keys[i]]);
                    }
                    menu.datparsed[i] = res[0];*/
                    if (i == menu.name.length - 1) {
                        cb();
                    }
                })
            }

        })
    },

    insertUser: function (conn, googinf, cb) {
        let vals = "'" + googinf.emails[0].value + "', '" + googinf.displayName + "', '" + googinf.id + "', " + 4;
        conn.query('INSERT INTO users (Email, dispName, GID, GroupID) VALUES (' + vals + ')', function (err, res, fields) {
            if (err) throw err;
            conn.query('SELECT * FROM users WHERE UserID = ' + res.insertId, function (err, res, fields) {
                cb(res[0]);
            })

        })
    },

    findUser: function (conn, googinf, cb) {
        conn.query('SELECT * FROM users WHERE GID = ' + googinf.id, function (err, res, fields) {
            if (res.length != 1) {
                cb(-1);
            } else {
                cb(res[0]);
            }
        });
    },

    findCreateUser: function (conn, googinf, cb) {
        this.findUser(conn, googinf, (res) => {
            if (res == -1) {
                this.insertUser(conn, googinf, (res2) => {
                    cb(res2);
                })
            } else {
                cb(res);
            }
        })
    },

    isAdmin: function (conn, userid, groupid, cb) {
        conn.query('SELECT Admin FROM users INNER JOIN groups ON users.GroupID = groups.GroupID WHERE users.UserID = ' + userid, function (err, res, fields) {
            if (err) throw err;
            if (res[0].Admin == true) {
                cb(true);
            } else {
                cb(false);
            }
        })
    },

    deleteSection: function (conn, type, sid, cb) {
        let secname = getType(type);

        conn.query('DELETE FROM ' + secname + ' WHERE SID = ' + sid, function (err, res, fields) {
            if (err) throw err;
            conn.query('DELETE FROM sections WHERE SID = ' + sid, function (err, res, fields) {
                if (err) throw err;
                cb();
            })
        })
    },

    updateSection: function (conn, body, sanitize, cb) {
        if (body.type == '2') {
            // console.log("----------------------------");
            // console.log(body);
            conn.query("UPDATE sections SET bgcolor='" + body.bgcolormain + "' WHERE SID = " + body.id, function (err, res, fields) {
                if (err) throw err;
                for (let i = 0; i < body.slideid.length; i++) {
                    let vals = "Image = '" + body.image[i] + "', Header = '" + body.header[i] + "', Description = '" + body.description[i] + "', bgcolor = '" + body.bgcolor[i] + "'";
                    conn.query("UPDATE sec_list_slides SET " + vals + " WHERE SlideID = " + body.slideid[i], function (err, res, fields) {
                        if (err) throw err;
                        console.log("Successfully updated!");
                        if (i == body.slideid.length - 1) {
                        cb();
                    }
                    })
                }
            })
        } else {
            let sec = getType(body.type);
            let fieldstr = '';
            let keys = Object.keys(body);
            let attr = sanitize.defaults.allowedAttributes;
            attr.font = ['size', 'face'];
            attr.p = ['style'];
            let opt = {
                allowedTags: sanitize.defaults.allowedTags.concat(['font']),
                allowedAttributes: attr
            };
            for (let i = 2; i < keys.length - 1; i++) {
                fieldstr = fieldstr + keys[i] + '=' + "'" + body[keys[i]] + "'";
                if (i != keys.length - 2) {
                    fieldstr = sanitize(fieldstr, opt) + ", ";
                }
            }

            conn.query("UPDATE sections SET bgcolor='" + body.bgcolor + "' WHERE SID = " + body.id, function (err, res, fields) {
                if (err) throw err;
                conn.query('UPDATE ' + sec + ' SET ' + fieldstr + ' WHERE SID = ' + body.id, function (err, res, fields) {
                    if (err) throw err;
                    cb();
                })
            });
        }
    },

    insertSection: function (conn, body, cb) {
        let vals = "'" + body.name + "', '" + body.shorthand + "', '" + body.type + "'";
        conn.query('INSERT INTO sections (Name, shorthand, Type) VALUES (' + vals + ')', function (err, res, fields) {
            if (err) throw err;
            let type = getType(body.type);
            conn.query('INSERT INTO ' + type + ' (SID) VALUES (' + res.insertId + ')', function (err, res, fields) {
                cb(res[0]);
            })

        })
    },

    insertSlide: function (conn, listid, body, cb) {
        let vals = "'" + body.bgcolor + "', '" + body.Description + "', '" + body.Header + "', '" + body.Image + "', " + listid;
        console.log("VALS", vals);
        conn.query('INSERT INTO sec_list_slides (bgcolor, Description, Header, Image, ListID) VALUES (' + vals + ')', function (err, res, fields) {
            if (err) throw err;
            console.log("INSERTED SLIDE");
            cb();
        })
    },

    removeSlide: function(conn, slideid, cb) {
        conn.query('DELETE FROM sec_list_slides WHERE SlideID = ' + slideid, function(err, res, fields) {
            if(err) throw err;
            cb();
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

function getSlides(conn, listid, cb) {
    conn.query('SELECT * FROM sec_list_slides WHERE ListID = ' + listid, function (err, res, fields) {
        if (err) throw err;
        console.log(res);
        cb(res)
    })
}
