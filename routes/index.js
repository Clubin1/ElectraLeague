
module.exports = {
    getHomePage: (req, res) => {
        db.query("SELECT * FROM article", (err, result1) => {
                db.query('SELECT * FROM registered_users;', (err, result) => {
                    if(err) throw err
                    console.log(result1)
                    if(req.session.loggedin){
                        res.render('index.ejs', {
                            article:result1,
                            username:req.session.username,
                            loggedIn: req.session.loggedin = true
                        })
                     } else {
                        res.render('index.ejs', {
                            article:result1,
                            username:req.session.username = 'Please Log In',
                            loggedIn: req.session.loggedin = false
                        })
                    }
                })
            })
    }
}