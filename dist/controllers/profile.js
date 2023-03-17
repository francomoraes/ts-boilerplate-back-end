var handleProfileGet = function (db) { return function (req, res) {
    var id = req.params.id;
    db.select('*')
        .from('users')
        .where({ id: id })
        .then(function (user) {
        if (user.length) {
            res.json(user[0]);
        }
        else {
            res.status(400).json('not found');
        }
    })["catch"](function (err) { return res.status(400).json('error getting user'); });
}; };
var handleProfilePut = function (db) { return function (req, res) {
    var _a = req.body, email = _a.email, name = _a.name;
    var id = req.params.id;
    db('users')
        .where({ id: id })
        .update({
        name: name,
        email: email
    })
        .returning('*')
        .then(function (user) {
        if (user.length) {
            res.json(user[0]);
        }
        else {
            res.status(400).json('not found');
        }
    })["catch"](function (err) { return res.status(400).json('error getting user'); });
}; };
module.exports = {
    handleProfilePut: handleProfilePut,
    handleProfileGet: handleProfileGet
};
