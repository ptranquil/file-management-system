"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../utils/appError"));
const ValidateZod = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        }
        catch (e) {
            const errorMessage = [];
            e.errors.map((err) => {
                errorMessage.push(`${err.message}`);
            });
            return next(new appError_1.default(errorMessage, 400));
        }
    };
};
exports.default = ValidateZod;
