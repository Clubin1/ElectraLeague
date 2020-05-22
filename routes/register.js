module.exports = {
    getRegisterPage: (req, res) => {
        db.query("SELECT * FROM registered_users;", (err, result) =>{
            if(err) throw err;

            console.log(result)

            res.render('register.ejs', {
                user: result
            });
            
        })
    },
};