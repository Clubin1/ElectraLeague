const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();
const users = [];
const bcrypt = require('bcrypt');
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

/*const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)*/

const {getAdminPage} = require('./routes/admin')
const {getContactPage} = require('./routes/contact');
const {getBansPage} = require('./routes/bans');
const {getPlayersPage} = require('./routes/player');
const {getServerPage} = require('./routes/server');
const {getHomePage} = require('./routes/index');
const {getLeaderboardPage} = require('./routes/leaderboard');
const {getLoginPage} = require('./routes/login');
const {getRegisterPage} = require('./routes/register');
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
const db = mysql.createConnection ({
    host: 'electraleague.site.nfoservers.com',
    user: 'electral1',
    password: 'SDadsok1414Sz',
    database: 'electral1_playerstats'
});

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

// configure middleware
app.set('views', __dirname + '/public/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//BRINGING IN ROUTES//
app.get('/', getHomePage);
app.get('/leaderboard', getLeaderboardPage);
app.get('/players', getPlayersPage);
app.get('/server', getServerPage);
app.get('/bans', getBansPage);
app.get('/contact', getContactPage);
app.get('/admin', checkAuthenticated, getAdminPage)
app.get('/login', getLoginPage)
app.get('/register', getRegisterPage)

// Haredest fucking query in the world like this was some stupid bs that dont know why or how it worked but it worked
app.get('/player/:single', (req,res) => {
    db.query("SELECT * FROM rankme;", (err, result) => {
        const chosen = result.find(f => f.id === parseInt(req.params.single));
        
        if(!chosen){
            return res.send('no match')
        }
        res.render('hello.ejs', 
            {
                chosen:chosen
            })
    })
})

//-----LOGIN/REGISTER/ADMIN CODE------//

//-----POST NEWS REQUEST CODE------//
app.post('/admin', (req, res) => {
    db.query('INSERT INTO article (name, body) Value(?, ?);', [req.body.name, req.body.article], (err, result)=>{
        if(err) throw err;
    })
    res.redirect('/admin')
})
//-----POST EVENTS REQUEST CODE------//
app.post('/admin2', (req, res) => {
    db.query('INSERT INTO events (name, body) Value(?, ?);', [req.body.name, req.body.body], (err, result)=>{
        if(err) throw err;
    })
    res.redirect('/admin')
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req,res) =>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})


app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if ( req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}
