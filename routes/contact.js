

module.exports = {
    getContactPage: (req, res) => {
                db.query('SELECT * FROM registered_users;', (err, result) => {
                    if(err) throw err
                    if(req.session.loggedin){
                        res.render('ban-appeal.ejs', {
                            username:req.session.username,
                            loggedIn: req.session.loggedin = true
                        })
                     } else {
                        res.render('ban-appeal.ejs', {
                            username:req.session.username = 'Please Log In',
                            loggedIn: req.session.loggedin = false
                        })
                    }
                })
    }
}