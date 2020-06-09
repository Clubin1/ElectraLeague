
module.exports = {
    getHomePage: (req, res) => {
        db.query("SELECT * FROM article", (err, result1) => {
            db.query("SELECT * FROM events", (err, result2) => {
                db.query('SELECT * FROM registered_users;', (err, result) => {
                    if(err) throw err
                    console.log(result1, result2)
                    if(req.session.loggedin){
                        res.render('index.ejs', {
                            article:result1,
                            event: result2,
                            username:req.session.username,
                        })
                     } else {
                        res.render('index.ejs', {
                            article:result1,
                            event: result2,
                            username:req.session.username,
                        })
                    }
                })
            })
        })
    }
}