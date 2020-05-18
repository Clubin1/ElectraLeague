module.exports = {
    getPlayersPage: (req, res) => {
        db.query("SELECT * FROM rankme;", (err, result) =>{
            if(err) throw err;

            res.render('player.ejs', {
                user: result
            });
            
        })
    },
};