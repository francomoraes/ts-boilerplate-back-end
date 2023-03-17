var handleSignIn = function (db, bcrypt) { return function (req, res) {
    var _a = req.body, email = _a.email, password = _a.password;
    if (!email || !password) {
        return res.status(400).json('incorrect form submission');
    }
    db.select('email', 'hash')
        .from('login')
        .where('email', '=', email)
        .then(function (data) {
        var isValid = bcrypt.compareSync(password, data[0].hash);
        if (isValid) {
            return db
                .select('*')
                .from('users')
                .where('email', '=', email)
                .then(function (user) {
                res.json(user[0]);
            })["catch"](function (err) {
                return res.status(400).json('unable to get user');
            });
        }
        else {
            res.status(400).json('wrong credentials');
        }
    })["catch"](function (err) { return res.status(400).json('wrong credentials'); });
}; };
module.exports = {
    handleSignIn: handleSignIn
};
