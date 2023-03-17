var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var cors = require('cors');
var knex = require('knex');
var db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true
    }
});
var app = express();
app.use(bodyParser.json());
app.use(cors());
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("app is running on port ".concat(PORT));
});
app.get('/', function (_a) {
    var req = _a.req, res = _a.res;
    console.log('backend is working');
    res.send('backend is working');
});
app.post('/signin', function (req, res) {
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
});
app.post('/register', function (req, res) {
    var _a = req.body, email = _a.email, name = _a.name, password = _a.password;
    if (!email || !name || !password) {
        return res.status(400).json('incorrect form submission');
    }
    var hash = bcrypt.hashSync(password);
    db.transaction(function (trx) {
        console.log('trx: ', trx);
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
});
app.get('/profile/:id', function (req, res) {
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
});
app.put('/profile/:id', function (req, res) {
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
});
