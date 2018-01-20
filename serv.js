const express = require('express'),
    path = require('path'),
    app = express(),
    config = require('./config.json'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    session = require('express-session'),
    bodyparser = require('body-parser'),
    //parser = require('bboxed'),
    sanitizeHtml = require('sanitize-html'),
    mysql = require('mysql'),
    connection = mysql.createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database
    }),
    sql = require('./sqlfunc.js'),
    socketIO = require('socket.io'),
    ioNotif = require('./notif.js');
let menu = {
    name: [],
    short: [],
    type: [],
    dat: [],
    datparsed: [],
    id: [],
    bg: []
};

/*parser.addTag('center', {
    open: function(token, options) {
        return '<span style="display: block; text-align: center;">';
    },
    close: '</spaan>'
});*/

connection.query('SELECT * FROM sections', function(err, res, fields) {
    if(err){
        throw new Error("Problem with connection to DB.");
    }
})

let serv = app.listen(3000, () => console.log('Example app listening on port 3000!'))

let io = socketIO(serv);
ioNotif.set(io, connection);
ioNotif.initConnection();

sql.reInitSections(connection, menu, () => {
    console.log('STARTING DAT', menu);
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
                ioNotif.setUser(user.UserID);
                return done(null, user);
            })
        });
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
app.use(bodyparser.json()); // to support JSON-encoded bodies
app.use(bodyparser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

app.use('/static', express.static(path.join(__dirname, 'public')))
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['email', 'profile']
    }));

app.get('/', (req, res) => {
    res.render('home', {
        title: "Title Message",
        nav: menu.name,
        navType: menu.type,
        navLink: menu.short,
        dat: menu.dat,
        bg: menu.bg,
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

require('./admin.js')(app, menu, connection, sql, ioNotif, sanitizeHtml)
