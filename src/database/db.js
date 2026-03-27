import { MongoClient } from "mongodb";

let client;

export const initializeDbConnection = async () => {
    try {
        client = new MongoClient("mongodb://localhost:27017");
        await client.connect();
        console.log("MongoDB connected");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
};

export const getDbConnection = (dbName) => {
    return client.db(dbName);
};