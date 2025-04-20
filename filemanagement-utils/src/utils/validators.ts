import { NextFunction, Request, Response } from "express";
import appError from "../utils/appError";

const ValidateZod = (schema: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(
                req.body
            )
            next();
        } catch (e:any) {
            const errorMessage: string[] = [];
            e.errors.map((err: any) => {
                errorMessage.push(`${err.message}`)
            })
            return next(new appError(errorMessage, 400));
        }
    }
}

export default ValidateZod;
