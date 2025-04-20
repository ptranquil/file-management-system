"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../utils/logger"));
dotenv_1.default.config();
const dbURL = process.env.DBURL;
if (!dbURL) {
    throw new Error('Unable to get the DB URL');
}
const dbConnection = async () => {
    try {
        const conn = await mongoose_1.default.connect(dbURL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        logger_1.default.info(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error("MongoDB connection failed:", error.message);
        logger_1.default.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};
exports.default = dbConnection;
