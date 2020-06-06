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

const {getHome2Page} = require('./routes/home')
const {getUserPage} = require('./routes/user')
const {getContactPage} = require('./routes/contact');
const {getBansPage} = require('./routes/bans');
const {getPlayersPage} = require('./routes/player');
const {getServerPage} = require('./routes/server');
const {getHomePage} = require('./routes/index');
const {getLeaderboardPage} = require('./routes/leaderboard');

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
app.get('/home', getHome2Page)

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
				response.send('Incorrect Username and/or Password!');
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

  app.delete('/logout', (request, response) => {
    request.session.loggedin = false;
    response.redirect('/admin_login');
})

  app.delete('/user_logout', (req, res) => {
      req.session.loggedin = false;
      res.redirect('/login')
  })

//Register
app.post('/register', (req, res) => {
    db.query('INSERT INTO registered_users (name, email, password) Value(?, ?, ?);', [req.body.name, req.body.email ,req.body.password], (err, result)=>{
        if(err) throw err;
        res.redirect('/login')
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
app.get('/admin', (req,res) =>{
    db.query('SELECT * FROM article UNION SELECT * FROM events;', (err, result) => {
        if(err) throw err
        console.log(result) 
        
        if(req.session.loggedIn){
            res.render('admin.ejs', {
                name:req.session.username,
                article:result
            })
        } else{
            res.send('pls login')
        }
    })
})

//Admin login
app.get('/admin_login', (req,res) =>{
    db.query('SELECT * FROM admin_users;', (err, result) => {
        if(err) throw err
        console.log(result) 
        
        if(req.session.loggedIn){
            res.send('Already logged in')
        } else{
            res.render('admin_login.ejs', {
                article:result
            })
        }
    })
})


//User login
app.get('/login', (req,res) =>{
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
				response.send('Incorrect Username and/or Password!');
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
   
    db.query('SELECT * FROM registered_users;', (err, result) => {
       
   
        if(err) throw err
        console.log(result) 
        
        if(req.session.loggedin){
            res.render('user_profile.ejs', {
                username:req.session.username,
                article:result
                
            })
        } else{
            res.send('pls login')
        }
     console.log(req.session.username)
    })

})
app.post('/user', (req, res) => {
   
    console.log(`${req.body.name}`)
    db.query('SELECT * FROM rankme WHERE name = ?', [req.body.name], (err, res) => {
        if(err) throw err
        console.log(`${res[0].deaths}<====================`)
        console.log(req.session.username)
        db.query('UPDATE registered_users SET rankme_name = ?, deaths = ? WHERE name = ?', [res[0].name, res[0].deaths, req.session.username], (err, result) => {
            console.log('hey')
        })
       
    } )
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
    db.query('SELECT * FROM registered_users;', (err, result) => {
        if(err) throw err
        console.log(result) 
        
        if(req.session.loggedin){
            res.send('Please logout to register an account')
        } else{
            res.render('register.ejs', {
                user: result
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
