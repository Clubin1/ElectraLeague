
module.exports = {
    getLeaderboardPage: (req, res) => {
        db.query("SELECT * FROM rankme ORDER BY score DESC;", (err, result) =>{
            if(err) throw err;

            console.log(result)

            res.render('leaderboard.ejs', {
                user: result
            });
            
        })
    },
};