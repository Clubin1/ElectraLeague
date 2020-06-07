module.exports = {
    getAdminPage: (req, res) => {
        db.query("SELECT * FROM article UNION SELECT * FROM events UNION SELECT * FROM banned_users;", (err, result) => {
            if(err) throw err
            console.log(result)
            res.render('admin.ejs', {
                article:result
            })
        })
    },
};