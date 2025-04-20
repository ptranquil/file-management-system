"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const verifyUser = (0, catchAsync_1.default)(async (req, res, next) => {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
    if (!token) {
        return next(new appError_1.default("Authentication failed. Token not provided.", 401));
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_USER_SECRETKEY, (err, decoded) => {
        if (err || !decoded) {
            return next(new appError_1.default("Unauthorized or invalid token.", 401));
        }
        res.locals.user = decoded;
        next();
    });
});
exports.verifyUser = verifyUser;
