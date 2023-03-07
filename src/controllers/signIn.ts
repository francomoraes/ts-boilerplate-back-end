const handleSignIn = (db: any, bcrypt: any) => (req: any, res: any) => {
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
};

module.exports = {
    handleSignIn: handleSignIn
};
