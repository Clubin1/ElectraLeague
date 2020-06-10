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
const flush = require('connect-flash')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

/*const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)*/

const {getHome2Page} = require('./routes/home')
const {getUserPage} = require('./routes/user')
const {getContactPage} = require('./routes/contact');
const {getBansPage} = require('./routes/bans');
const {getPlayersPage} = require('./routes/player');
const {getServerPage} = require('./routes/server');
const {getHomePage} = require('./routes/index');
const {getLeaderboardPage} = require('./routes/leaderboard');
const {getAppealPage} = require('./routes/banappeal')
const {getFaqPage} = require('./routes/faq')

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
app.use(flush())
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
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
app.get('/appeal', getAppealPage)
app.get('/faq', getFaqPage)

//
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
    db.query('INSERT INTO article (name, body, imgg) Value(?, ?, ?);', [req.body.name, req.body.article, req.body.imgg], (err, result)=>{
        if(!err){
            req.flash('error', 'News article posted successfully')
            res.redirect('/admin')
        } else {
            res.redirect('/admin')
        }
    })
})

app.get('/admin_ban', (req,res) =>{
    const errors = req.flash().error || []
    db.query('SELECT * FROM article;', (err, result) => {
        if(err) throw err
        console.log(result) 
        
        if(req.session.loggedIn){
            res.render('admin_ban.ejs', {
                name:req.session.username,
                article:result,
                errors,
            })
        } else{
            res.redirect('/admin_login')
        }
    })
})
//-----POST BANS REQUEST CODE------//
app.post('/admin_ban', (req, res) => {
    db.query('INSERT INTO banned_users (name, type, game, duration, steam_id) Value(?, ?, ?, ?, ?);', [req.body.name, req.body.type, req.body.game, req.body.duration, req.body.steam_id], (err, result)=>{
        if(!err){
            req.flash('error', 'User banned successfully')
            res.redirect('/admin_ban')
        }else{
            res.redirect('/admin_ban')
        }
    })
})

//-----POST EVENTS REQUEST CODE------//

/*
app.post('/admin2', (req, res) => {
    db.query('INSERT INTO events (namee, bodyy, img) Value(?, ?, ?);', [req.body.namee, req.body.bodyy, req.body.img], (err, result)=>{
        if(err) throw err;
    })
    res.redirect('/admin')
})
*/
//Admin Route
app.get('/admin', (req,res) =>{
    const errors = req.flash().error || []
    db.query('SELECT * FROM article;', (err, result) => {
        if(err) throw err
        console.log(result) 
        
        if(req.session.loggedIn){
            res.render('admin.ejs', {
                name:req.session.username,
                article:result,
                errors
            })
        } else{
            res.redirect('/admin_login')
        }
    })
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

//login
app.post('/admin_login', function(request, response) {
	var username = request.body.name;
	var password = request.body.password;
	if (username && password) {
		db.query('SELECT * FROM admin_users   WHERE name = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedIn = true;
				request.session.username = username;
				response.redirect('/admin');
			} else {
                request.flash('error', 'Invalid Password and or Username')
                //Put flash message
                response.redirect('/admin_login')
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/admin_login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/admin_login',
    failureFlash: true
  }))

  app.delete('/admin_logout', (request, response) => {
    request.session.loggedIn = false;
    response.redirect('/admin_login');
})

  app.delete('/user_logout', (req, res) => {
      req.session.loggedin = false;
      res.redirect('/login')
  })

//Register
app.post('/register', (req, res) => {
    db.query('INSERT INTO registered_users (name, email, password) Value(?, ?, ?);', [req.body.name, req.body.email ,req.body.password], (err, result)=>{
        if(!err){
            req.flash('error', 'User created successfully')
            res.redirect('/register')
        } else {
            res.redirect('/register')
        }
    })
})

/*
app.get('/admin', (req, res) => {
    db.query("SELECT * FROM article UNION SELECT * FROM events;", (err, result) => {
        if(err) throw err
        console.log(result)
        res.render('admin.ejs', {
            article:result
        })
    })
	if (req.session.loggedin) {
		res.send('Welcome back, ' + req.session.username + '!');
	} else {
		res.send('Please login to view this page!');
	}
	res.end();
});
*/

//Admin login
app.get('/admin_login', (req,res) =>{
    const errors = req.flash().error || []
    db.query('SELECT * FROM admin_users;', (err, result) => {
        if(err) throw err
        console.log(result) 
        
        if(req.session.loggedIn){
            res.redirect('/admin')
        } else{
            res.render('admin_login.ejs', {
                article:result,
                errors
            })
        }
    })
})


//User login
app.get('/login', (req,res) =>{
    const errors = req.flash().error || []
    db.query('SELECT * FROM registered_users;', (err, result) => {
        if(err) throw err
        console.log(result) 
        
        if(req.session.loggedin){
            res.redirect('/user')
        } else{
            res.render('login.ejs', {
                article:result,
                errors
            })
        }
    
    })
})
//login
app.post('/login', function(request, response) {
	var username = request.body.name;
	var password = request.body.password;
	if (username && password) {
		db.query('SELECT * FROM registered_users WHERE name = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
                request.session.loggedin = true;
                request.session.loggedIN = true;
                request.session.username = username;
				response.redirect('/user');
			} else {
                request.flash('error', 'Invalid Password and or Username')
                response.redirect('/login')
                //put flash message
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});
//User Page and account linkage
app.get('/user', (req,res) =>{
    console.log(`hello ${req.session.username} <======`)
   
    db.query('SELECT * FROM registered_users;', (err, result) => {
        
    
        if(err) throw err
        console.log(result) 
        if(req.session.loggedin){
        db.query('SELECT * FROM registered_users WHERE name = ?', [req.session.username], (error, response) => {
            console.log(`hello ${JSON.stringify(response)} <======`)
     
                        res.render('user_profile.ejs', {
                            username:req.session.username,
                            article:result,
                            person: response
                            
                        })
    
          

        })
    } else{
        res.redirect('/login')
    }
        
     console.log(req.session.username)
    })

})
//Link player query
app.post('/user', (req, res) => {
   

    console.log(`${req.body.name}`)
    db.query('SELECT * FROM rankme WHERE name = ?', [req.body.name], (err, res) => {
        if(err) throw err
        console.log(req.session.username)
        db.query('UPDATE registered_users SET rankme_name = ?, rankme_score = ?, rankme_wins = ?, rankme_losses = ?, rankme_kills = ?, rankme_draws = ? WHERE name = ?', 
        [res[0].name, res[0].score, res[0].match_win, res[0].match_lose, res[0].kills, res[0].match_draw, req.session.username], (err, result) => {
            console.log('hey')
        })
       
    })
    res.redirect('/user')
})



/*
app.get('/admin_login', (req,res) =>{
    db.query('SELECT * FROM registered_users;', (err, result) => {
        if(err) throw err
        console.log(result) 
        
        if(req.session.loggedin){
            res.send('Already logged in')
        } else{
            res.render('login.ejs', {
                article:result
            })
        }
    })
})
/* REGISTER AUTH 
module.exports = {
    getRegisterPage: (req, res) => {
        db.query("SELECT * FROM registered_users;", (err, result) =>{
            if(err) throw err;

            console.log(result)

            res.render('register.ejs', {
                user: result
            });
            
        })
    },
};
*/

app.get('/register', (req,res) =>{
    const errors = req.flash().error || []
    db.query('SELECT * FROM registered_users;', (err, result) => {
        if(err) throw err
        console.log(result) 
        
        if(req.session.loggedin){
            res.send('Please logout to register an account')
        } else{
            res.render('register.ejs', {
                user: result,
                errors
            });
        }
    })
})
/*
app.get('/message', (req, res, next)=>{
    res.render('message.ejs')
})

io.on('connection', (socket)=>{
    console.log("a user connected via socket!")
    socket.on('disconnect', ()=>{
        console.log("a user disconnected!")
    })
    socket.on('chat message', (msg)=>{
        console.log("Message: "+msg)
        io.emit('chat message', msg)
    })
})
*/
const server = require('http').createServer(app)
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
})

const io = require('socket.io')(server)

io.on('connection', (socket)=>{
    console.log("a user connected via socket!")
    socket.on('disconnect', ()=>{
        console.log("a user disconnected!")
    })
    socket.on('chat message', (msg)=>{
        console.log("Message: "+msg)
        io.emit('chat message', msg)
    })
})

app.get('/message', (req,res) =>{
    db.query('SELECT * FROM registered_users;', (err, result) => {
        if(err) throw err
        console.log(result) 
        if(req.session.loggedIN){
            res.render('message.ejs', {
                username:req.session.username,
                article:result
            })
        } else{
            res.send('pls login')
        }
    })
})

