const handleProfileGet = (db: any) => (req: any, res: any) => {
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
};

const handleProfilePut = (db: any) => (req: any, res: any) => {
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
};

module.exports = {
    handleProfilePut: handleProfilePut,
    handleProfileGet: handleProfileGet
};
