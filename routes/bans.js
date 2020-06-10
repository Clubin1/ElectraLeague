
module.exports = {
    getBansPage: (req, res) => {
        db.query("SELECT * FROM banned_users", (err, result1) => {
                db.query('SELECT * FROM registered_users;', (err, result) => {
                    if(err) throw err
                    console.log(result1)
                    if(req.session.loggedin){
                        res.render('bans.ejs', {
                            user:result1,
                            username:req.session.username,
                            loggedIn: req.session.loggedin = true
                        })
                     } else {
                        res.render('bans.ejs', {
                            user:result1,
                            username:req.session.username = 'Please Log In',
                            loggedIn: req.session.loggedin = false
                        })
                    }
                })
            })
    }
}