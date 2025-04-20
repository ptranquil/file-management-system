import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync";
import appError from "../utils/appError";
import { NextFunction, Request, Response } from "express";

const verifyUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return next(
                new appError("Authentication failed. Token not provided.", 401)
            );
        }

        jwt.verify(token, process.env.JWT_USER_SECRETKEY!, (err, decoded) => {
            if (err || !decoded) {
                return next(
                    new appError("Unauthorized or invalid token.", 401)
                );
            }

            res.locals.user = decoded;
            next();
        });
    }
);

export { verifyUser };
