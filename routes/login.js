module.exports = {
    getLoginPage: (req, res) => {
        db.query("SELECT * FROM registered_users;", (err, result) =>{
            if(err) throw err;

            console.log(result)

            res.render('login.ejs', {
                user: result
            });
            
        })
    },
};