const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        hostname:
            'https://dpg-cg3sm5ndvk4hn47amoo0-a.oregon-postgres.render.com',
        port: 5432,
        database: 'boilerplate_hind',
        username: 'francomoraes',
        password: 'QAo0Vj1yv5JF5Gy0h5XMBDvZumi4x4L4'
        // host: 'dpg-cg3sm5ndvk4hn47amoo0-a'
        // user: 'postgres',
        // password: '',
        // database: 'smartbrain'
    }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
});

app.get('/', ({ req, res }: any) => {
    console.log('backend is working');
    res.send('backend is working');
});

app.post('/signin', (req: any, res: any) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json('incorrect form submission');
    }
    db.select('email', 'hash')
        .from('login')
        .where('email', '=', email)
        .then((data: any) => {
            const isValid = bcrypt.compareSync(password, data[0].hash);
            if (isValid) {
                return db
                    .select('*')
                    .from('users')
                    .where('email', '=', email)
                    .then((user: any) => {
                        res.json(user[0]);
                    })
                    .catch((err: any) =>
                        res.status(400).json('unable to get user')
                    );
            } else {
                res.status(400).json('wrong credentials');
            }
        })
        .catch((err: any) => res.status(400).json('wrong credentials'));
});

app.post('/register', (req: any, res: any) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res.status(400).json('incorrect form submission');
    }
    const hash = bcrypt.hashSync(password);
    db.transaction((trx: any) => {
        trx.insert({
            hash: hash,
            email: email
        })
            .into('login')
            .returning('email')
            .then((loginEmail: any) => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0].email,
                        name: name,
                        joined: new Date()
                    })
                    .then((user: any) => {
                        res.json(user[0]);
                    });
            })
            .then(trx.commit)
            .catch(trx.rollback);
    }).catch((err: any) => res.status(400).json('unable to register'));
});

app.get('/profile/:id', (req: any, res: any) => {
    const { id } = req.params;
    db.select('*')
        .from('users')
        .where({ id })
        .then((user: any) => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(400).json('not found');
            }
        })
        .catch((err: any) => res.status(400).json('error getting user'));
});

app.put('/profile/:id', (req: any, res: any) => {
    const { email, name } = req.body;
    const { id } = req.params;
    db('users')
        .where({ id })
        .update({
            name: name,
            email: email
        })
        .returning('*')
        .then((user: any) => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(400).json('not found');
            }
        })
        .catch((err: any) => res.status(400).json('error getting user'));
});
