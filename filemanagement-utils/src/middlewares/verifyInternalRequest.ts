import catchAsync from "../utils/catchAsync";
import appError from "../utils/appError";
import { NextFunction, Request, Response } from "express";

const verifyInternalRequest = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const internalToken = req.headers["x-internal-token"];
        if (internalToken && internalToken === process.env.INTERNAL_SECRET) {
            res.locals.internal = true;
            return next();
        }

        return next(
            new appError(
                "Authentication failed. Internal token not valid!",
                401
            )
        );
    }
);

export { verifyInternalRequest };
