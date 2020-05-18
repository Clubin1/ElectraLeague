const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();

const {getContactPage} = require('./routes/contact');
const {getBansPage} = require('./routes/bans');
const {getPlayersPage} = require('./routes/player');
const {getServerPage} = require('./routes/server');
const {getHomePage} = require('./routes/index');
const {getLeaderboardPage} = require('./routes/leaderboard');
// const {addPlayerPage, addPlayer, deletePlayer, editPlayer, editPlayerPage} = require('./routes/player');
const port = 5000;

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
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/public/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload

app.get('/', getHomePage);
app.get('/leaderboard', getLeaderboardPage);
app.get('/players', getPlayersPage);
app.get('/server', getServerPage);
app.get('/bans', getBansPage);
app.get('/contact', getContactPage);

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

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
