module.exports = {
    getServerPage: (req, res) => {
        db.query("SELECT * FROM servers;", (err, result) =>{
            if(err) throw err;

            console.log(result)

            res.render('server.ejs', {
                user: result
            });
            
        })
    },
};
