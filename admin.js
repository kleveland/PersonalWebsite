module.exports = function (app) {

    app.get('/admin', (req, res) => {
        //sql.isAdmin(connection, req.session.passport.user.UserID, req.session.passport.user.GroupID, (isAdmin) => {
        if (req.session.passport != null && req.session.passport.user != null && req.session.passport.user.isAdmin) {
            res.render('admin/admin', {
                title: "Title Message",
                nav: ["Home", "About Me", "Skills and CV", "Projects"],
                navLink: ['home', 'about', 'cv', 'projects']
            });
        } else {
            res.redirect('/404')
        }
        //})
    })

    app.get('/admin/dashboard', function (req, res) {

    });

    app.get('/admin/settings', function (req, res) {

    });

    app.get('/admin/users', function (req, res) {

    });

    //other routes..
}
