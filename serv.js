const express = require('express'),
    path = require('path'),
    app = express(),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    session = require('express-session'),
    bodyparser = require('body-parser'),
    //parser = require('bboxed'),
    sanitizeHtml = require('sanitize-html'),
    mysql = require('mysql'),
    sql = require('./sqlfunc.js'),
    socketIO = require('socket.io'),
    ioNotif = require('./notif.js');

let googleconf;

try {
    googleconf = require('./config.json');
} catch(e) {
    googleconf = {
        auth: {
            google: {}
        }
    };
}

let config = {
    database: {
        host: "localhost",
        user: "root",
        password: "",
        database: "personaldb"
    }
};

console.log(config);

config.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
config.ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

if (process.env.OPENSHIFT_MYSQL_PASSWORD) {
    config.database.host = process.env.OPENSHIFT_MYSQL_HOST;
    config.database.user = process.env.OPENSHIFT_MYSQL_USER;
    config.database.password = process.env.OPENSHIFT_MYSQL_PASSWORD;
    config.database.database = process.env.OPENSHIFT_MYSQL_DATABASE;
}

if(process.env.OPENSHIFT_GOOG_ID) {
    googleconf.auth.google.client_id = process.env.OPENSHIFT_GOOG_ID;
    googleconf.auth.google.secret = process.env.OPENSHIFT_GOOG_SECRET;
    googleconf.auth.google.callback = process.env.OPENSHIFT_GOOG_CALLBACK;
}

console.log(config);

const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
});


let menu = {
    name: [],
    short: [],
    type: [],
    dat: [],
    datparsed: [],
    id: [],
    bg: [],
    p_bg: []
};

connection.query('SELECT * FROM sections', function (err, res, fields) {
    if (err) {
        throw new Error("Problem with connection to DB.");
    }
})

let serv = app.listen(config.port, config.ip, () => console.log('Example app listening ' + config.ip + ':' + config.port + '!'))

let io = socketIO(serv);
ioNotif.set(io, connection);
ioNotif.initConnection();

sql.reInitSections(connection, menu, () => {});

//passport setup
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new GoogleStrategy({
        clientID: googleconf.auth.google.client_id,
        clientSecret: googleconf.auth.google.secret,
        callbackURL: googleconf.auth.google.callback
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
        p_bg: menu.p_bg,
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
