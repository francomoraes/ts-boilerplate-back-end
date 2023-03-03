const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const signIn = require('./controllers/signIn');
const register = require('./controllers/register');
const profile = require('./controllers/profile');

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'pordj55@',
        database: 'smartbrain'
    }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
});

app.post('/signin', signIn.handleSignIn(db, bcrypt));

app.post('/register', register.handleRegister(db, bcrypt));

app.get('/profile/:id', profile.handleProfileGet(db));

app.put('/profile/:id', profile.handleProfilePut(db));
