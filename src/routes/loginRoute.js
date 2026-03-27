import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDbConnection } from "../database/db";

export const loginRoute = {
    path: '/api/login',
    method: 'post',
    handler: async (req, res) => {
        const { email, password } = req.body;
        const db = getDbConnection('react-auth-db');
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.sendStatus(404).json({ messgae: 'user not found' });
        }
        const { _id: id, isVerified, passwordHash, info } = user;
        const isCorrect = await bcrypt.compare(password, passwordHash);
        if (!isCorrect) {
            return res.sendStatus(401).json({ message: 'invalid password.' })
        }
        jwt.sign(
            { id, isVerified, email, info },
            process.env.JWT_SECRET,
            { expiresIn: '2d' },
            (err, token) => {
                if (err) {
                    res.status(401).json(err);
                }
                return res.status(200).json({ token })
            })
    }
}