import mongoose from "mongoose";
import dotenv from "dotenv";
import appLogger from "../utils/logger";

dotenv.config()
const dbURL = process.env.DBURL;

if (!dbURL) {
    throw new Error('Unable to get the DB URL')
}

const dbConnection = async () => {
    try {
        const conn = await mongoose.connect(dbURL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        appLogger.info(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error: any) {
        console.error("MongoDB connection failed:", error.message);
        appLogger.error("MongoDB connection failed:", error.message)
        process.exit(1);
    }
};

export default dbConnection;