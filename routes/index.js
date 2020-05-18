module.exports = {
    getHomePage: (req, res) => {
        db.query("SELECT * FROM rankme;", (err, result) =>{
            if(err) throw err;

            console.log(result)

            res.render('index.ejs', {
                user: result
            });
            
        })
    },
};