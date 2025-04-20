"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyInternalRequest = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const verifyInternalRequest = (0, catchAsync_1.default)(async (req, res, next) => {
    const internalToken = req.headers["x-internal-token"];
    if (internalToken && internalToken === process.env.INTERNAL_SECRET) {
        res.locals.internal = true;
        return next();
    }
    return next(new appError_1.default("Authentication failed. Internal token not valid!", 401));
});
exports.verifyInternalRequest = verifyInternalRequest;
