import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDbConnection } from "../database/db";

export const signUpRoute = {
    path: 'signup',
    method: 'post',
    handler: async (request, response) => {
        const { email, password } = request.body;
        const db = getDbConnection('react-auth-db');

        const user = await db.collection('users').findOne({ email });
        if (user) {
            response.sendStatus(409);
        }

        const paswordHash = await bcrypt.hash(password, 10);
        const startingInfo = {
            hairColor: '',
            favoriteFood: '',
            bio: ''
        }
        const result = await db.collection('users').insertOne({
            email,
            paswordHash,
            info: startingInfo,
            isVerified: false
        });
        const { insertedId } = result;
        jwt.sign({
            id: insertedId,
            email,
            info: startingInfo,
            isVerified: false
        }, process.env.JWT_SECRET, {
            expiresIn: '2d'
        }, (err, token) => {
            if (err) return response.status(500).send(err);
            response.status(200).json({ token });
        })
    }
}