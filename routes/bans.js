
module.exports = {
    getBansPage: (req, res) => {
        db.query("SELECT * FROM banned_users;", (err, result) =>{
            if(err) throw err;

            console.log(result)

            res.render('bans.ejs', {
                user: result
            });
            
        })
    },
};