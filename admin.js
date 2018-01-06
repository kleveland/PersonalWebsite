module.exports = function (app, menu, conn, sql, io) {
    function handleAdmin(req, res, menu, cb) {
        if (req.session.passport != null && req.session.passport.user != null && req.session.passport.user.isAdmin) {
            io.getNotif((not) => {
                menu.notif = not;
                cb();
            })
        } else {
            res.redirect('/404');
        }
    }

    app.get('/admin', (req, res) => {
        //sql.isAdmin(connection, req.session.passport.user.UserID, req.session.passport.user.GroupID, (isAdmin) => {
        handleAdmin(req, res, menu, () => {
            res.render('admin/admin', menu);
        })
        //})
    })

    app.get('/admin/edit', function (req, res) {
        handleAdmin(req, res, menu, () => {
            console.log("MENU", menu);
            res.render('admin/edit', menu)
        })
    });

    app.post('/admin/deleteblock', function (req, res) {
        handleAdmin(req, res, menu, () => {
            console.log(req.body)
            sql.deleteSection(conn, req.body.type, req.body.id, () => {
                console.log("delete complete")
                sql.reInitSections(conn, menu, () => {
                    let idx;
                    for (let i = 0; i < menu.id.length; i++) {
                        if (menu.id[i] == req.body.id) {
                            idx = i;
                            break;
                        }
                    }
                    let keys = Object.keys(menu);
                    keys.splice(keys.length - 1, 1);
                    console.log(keys);
                    for (let i = 0; i < keys.length; i++) {
                        menu[keys[i]].splice(idx, 1);
                        console.log(keys[i], "removed.");
                    }
                    io.postNotif('Removed section "' + req.body.name + '".', 1);
                    res.redirect('/admin/edit')
                });
            })
        })
    })

    app.post('/admin/updateblock', function (req, res) {
        handleAdmin(req, res, menu, () => {
            console.log("body", req.body);
            sql.updateSection(conn, req.body, () => {
                sql.reInitSections(conn, menu, () => {
                    //res.sendStatus(200);
                    let updateName = '';
                    for (let i = 0; i < menu.name.length; i++) {
                        if (menu.id[i] == req.body.id) {
                            updateName = menu.name[i];
                            break;
                        }
                    }
                    io.postNotif('Updated section "' + updateName + '".', 1);
                    res.redirect('/admin/edit')
                })
            })
        })
    })

    app.post('/admin/insertblock', function (req, res) {
        handleAdmin(req, res, menu, () => {
            console.log("body2", req.body);
            sql.insertSection(conn, req.body, () => {
                console.log("Inserted new section.");
                sql.reInitSections(conn, menu, () => {
                    io.postNotif('Inserted new section "' + req.body.name + '".', 1);
                    res.redirect('/admin/edit')
                });
            })
        })
    })

    app.get('/admin/settings', function (req, res) {
        handleAdmin(req, res, menu, () => {

        })

    });

    app.get('/admin/users', function (req, res) {
        handleAdmin(req, res, menu, () => {

        })

    });

    //other routes..
}
