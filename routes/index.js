
module.exports = {
    getHomePage: (req, res) => {
        db.query("SELECT * FROM article", (err, result1) => {
            db.query("SELECT * FROM events", (err, result2) => {
                if(err) throw err
                console.log(result1, result2)
                res.render('index.ejs', {
                    article:result1,
                    event: result2
                })
            })
        })
    }}
