module.exports = function (app, menu, conn, sql) {
    function handleAdmin(req, res, cb) {
        if (req.session.passport != null && req.session.passport.user != null && req.session.passport.user.isAdmin) {
            cb();
        } else {
            res.redirect('/404');
        }
    }

    app.get('/admin', (req, res) => {
        //sql.isAdmin(connection, req.session.passport.user.UserID, req.session.passport.user.GroupID, (isAdmin) => {
        handleAdmin(req, res, () => {
            res.render('admin/admin', {
                title: "Title Message",
                nav: ["Home", "About Me", "Skills and CV", "Projects"],
                navLink: ['home', 'about', 'cv', 'projects']
            });
        })
        //})
    })

    app.get('/admin/edit', function (req, res) {
        handleAdmin(req, res, () => {
            if (req.session.not) {
                menu.not = req.session.not;
                menu.nottype = req.session.nottype;
            } else {
                menu.not = undefined;
                menu.nottype = undefined;
            }
            console.log(menu);
            req.session.not = undefined;
            res.render('admin/edit', menu)
        })
    });

    app.post('/admin/updateblock', function (req, res) {
        handleAdmin(req, res, () => {
            console.log("body", req.body);
            sql.updateSection(conn, req.body, () => {
                sql.reInitSections(conn, menu);
                //res.sendStatus(200);
                let updateName = '';
                for (let i = 0; i < menu.name.length; i++) {
                    if (menu.id[i] == req.body.id) {
                        updateName = menu.name[i];
                        break;
                    }
                }
                req.session.not = 'Updated section "' + updateName + '"';
                req.session.nottype = 1;
                res.redirect('/admin/edit')
            })
        })
    })

    app.get('/admin/settings', function (req, res) {
        handleAdmin(req, res, () => {

        })

    });

    app.get('/admin/users', function (req, res) {
        handleAdmin(req, res, () => {

        })

    });

    //other routes..
}
