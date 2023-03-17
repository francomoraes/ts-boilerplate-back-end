var handleRegister = function (db, bcrypt) { return function (req, res) {
    var _a = req.body, email = _a.email, name = _a.name, password = _a.password;
    if (!email || !name || !password) {
        return res.status(400).json('incorrect form submission');
    }
    var hash = bcrypt.hashSync(password);
    db.transaction(function (trx) {
        trx.insert({
            hash: hash,
            email: email
        })
            .into('login')
            .returning('email')
            .then(function (loginEmail) {
            return trx('users')
                .returning('*')
                .insert({
                email: loginEmail[0].email,
                name: name,
                joined: new Date()
            })
                .then(function (user) {
                res.json(user[0]);
            });
        })
            .then(trx.commit)["catch"](trx.rollback);
    })["catch"](function (err) { return res.status(400).json('unable to register'); });
}; };
module.exports = {
    handleRegister: handleRegister
};
