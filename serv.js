const express = require('express'),
    path = require('path'),
    app = express(),
    config = require('./config.json'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    session = require('express-session'),
    mysql = require('mysql'),
    connection = mysql.createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database
    }),
    sql = require('./sqlfunc.js');
let menu = {
    name: [],
    short: [],
    type: [],
    dat: [],
    id: []
};
connection.query('SELECT * FROM sections', function (err, res, fields) {
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
        connection.query('SELECT * FROM ' + secname + ' WHERE SID="' + menu.id[i] + '"', function (err, res, fields) {
            menu.dat[i] = res[0];
            //console.log('tester',menu.dat[i].SID);
        })
    }

    //console.log(menu);

});

//passport setup
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new GoogleStrategy({
        clientID: config.auth.google.client_id,
        clientSecret: config.auth.google.secret,
        callbackURL: config.auth.google.callback
    },
    function (accessToken, refreshToken, profile, done) {
        sql.findCreateUser(connection, profile, function (user) {
            sql.isAdmin(connection, user.UserID, user.GroupID, (isAdmin) => {
                user.isAdmin = isAdmin;
                console.log('done', user);
                return done(null, user);
            })
        });
        //console.log("connected", JSON.stringify(profile))
        //return done(null, profile);
    }
));

app.use(session({
    secret: 'cookie_secret',
    name: 'kaas',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


app.use('/static', express.static(path.join(__dirname, 'public')))
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

console.log(path.join(__dirname, 'public'));

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['email', 'profile']
    }));

app.get('/', (req, res) => {
    console.log(req.session)
    res.render('home', {
        title: "Title Message",
        nav: menu.name,
        navType: menu.type,
        navLink: menu.short,
        dat: menu.dat,
        user: req.session,
    });
})

app.get('/404', (req, res) => {
    res.render('404');
})

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/admin'
    }));

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

require('./admin.js')(app, menu)

app.listen(3000, () => console.log('Example app listening on port 3000!'))
