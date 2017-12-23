const express = require('express')
const path = require('path')
const app = express()
const config = require('./config.json')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const session = require('express-session')
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
        /*User.findOrCreate({ googleId: profile.id }, function (err, user) {
          return done(err, user);
        });*/
        console.log("connected", JSON.stringify(profile))
        return done(null, profile);
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
        nav: ["Home", "About Me", "Skills and CV", "Projects"],
        navLink: ['home', 'about', 'cv', 'projects'],
        user: req.session
    });
})

app.get('/admin', (req, res) => {
    if(req.session.passport.user != null) {
        res.render('admin', {
            title: "Title Message",
            nav: ["Home", "About Me", "Skills and CV", "Projects"],
            navLink: ['home', 'about', 'cv', 'projects']
        });
    } else {
        res.redirect('/404')
    }
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

app.listen(3000, () => console.log('Example app listening on port 3000!'))
