module.exports = function (app, menu, conn, sql, io, sanitizeHtml) {
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
        handleAdmin(req, res, menu, () => {
            res.render('admin/admin', menu);
        })
        //})
    })

    app.get('/admin/edit', function (req, res) {
        handleAdmin(req, res, menu, () => {
            res.render('admin/edit', menu)
        })
    });

    app.post('/admin/deleteblock', function (req, res) {
        handleAdmin(req, res, menu, () => {
            sql.deleteSection(conn, req.body.type, req.body.id, () => {
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
                    for (let i = 0; i < keys.length; i++) {
                        menu[keys[i]].splice(idx, 1);
                    }
                    io.postNotif('Removed section "' + req.body.name + '".', 1);
                    res.redirect('/admin/edit')
                });
            })
        })
    })

    app.post('/admin/updateblock', function (req, res) {
        handleAdmin(req, res, menu, () => {
            sql.updateSection(conn, req.body, sanitizeHtml, () => {
                sql.reInitSections(conn, menu, () => {
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
            sql.insertSection(conn, req.body, (id) => {
                if (req.body.type == 2) {
                    sql.insertSlide(conn, id, {
                        bgcolor: 'rgb(0,0,0)',
                        Image: 'http://via.placeholder.com/300x300',
                        Header: 'Filler Header',
                        Description: 'Filler Description'
                    }, () => {

                    });
                }
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

    app.post('/admin/addslide/:id', function (req, res) {
        handleAdmin(req, res, menu, () => {
            let defaults = {
                bgcolor: 'rgb(0,0,0)',
                Image: 'http://via.placeholder.com/300x300',
                Header: 'Filler Header',
                Description: 'Filler Description'
            }
            sql.insertSlide(conn, req.params.id, defaults, (id) => {
                sql.reInitSections(conn, menu, () => {
                    let updateName = '';
                    for (let i = 0; i < menu.name.length; i++) {
                        if (menu.type[i] == 2 && menu.dat[i].id == req.params.id) {
                            updateName = menu.name[i];
                            break;
                        }
                    }
                    io.postNotif('Added slide to section "' + updateName + '".', 1);
                    res.redirect('back');
                })
            })
        })
    })

    app.post('/admin/removeslide/:slideid', function (req, res) {
        handleAdmin(req, res, menu, () => {
            sql.removeSlide(conn, req.params.slideid, () => {
                sql.reInitSections(conn, menu, () => {
                    io.postNotif('Removed slide.', 1);
                    res.redirect('back');
                });
            })
        })
    })

    //other routes..
}
