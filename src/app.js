require('dotenv').config();
require('./strategies/discordstrategy');
const express = require('express');
const app = express();
const PORT = require("../config.json")
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const db = require('./database/database');
const path = require('path');
const mongoose = require('mongoose');

db.then(() => require("@greencoast/logger").info('Connected to MongoDB.')).catch(err => require("@greencoast/logger").error(err));
// Routes
const authRoute = require('./routes/auth');
const dashboardRoute = require('./routes/dashboard');

app.use(session({
    secret: 'some random secret',
    cookie: {
        maxAge: 60000 * 60 * 24
    },
    saveUninitialized: false,
    resave: false,
    name: 'token',
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware Routes
app.use('/auth', authRoute);
app.use('/dashboard', dashboardRoute);

app.get('/', isAuthorized, (req, res) => {
    res.render('home');
});

function isAuthorized(req, res, next) {
    if (req.user) {
        res.redirect('/dashboard');
    } else {
        next();
    }
}

app.listen(PORT, () => require("@greencoast/logger").info(`Now listening to requests on port ${PORT}`));

// https://discordapp.com/developers/docs/topics/permissions