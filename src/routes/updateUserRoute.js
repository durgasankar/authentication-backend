import jwt from 'jsonwebtoken';
import { getDbConnection } from '../database/db';
import { ObjectId } from 'mongodb';

export const updateUserRoute = {
    path: '/api/users/:id',
    method: 'put',
    handler: async (req, res) => {
        try {
            const { authorization } = req.headers;
            const { id: userId } = req.params;

            if (!authorization) {
                return res.status(401).json({ message: 'No authorization header' });
            }

            const token = authorization.split(" ")[1];

            // ⬇ FIX: decode token using promise wrapper
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const { id } = decoded;

            if (id !== userId) {
                return res.status(403).json({ message: 'Not allowed to update this user' });
            }

            const { favoriteFood, hairColor, bio } = req.body;
            const updates = { favoriteFood, hairColor, bio };

            const db = getDbConnection("react-auth-db");

            const result = await db.collection("users").findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { info: updates } },
                { returnDocument: "after" }
            );

            if (!result.value) {
                return res.status(404).json({ message: "User not found" });
            }

            const { email, isVerified, info } = result.value;

            const newToken = jwt.sign(
                { id, email, isVerified, info },
                process.env.JWT_SECRET,
                { expiresIn: "2d" }
            );

            return res.status(200).json({ token: newToken });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error updating user" });
        }
    }
};