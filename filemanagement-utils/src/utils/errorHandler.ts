import { NextFunction, Request, Response } from "express";
import appError from "../utils/appError";
import appLogger from "./logger";

const SERVICE_PREFIX = process.env.SERVICE_PREFIX || "";

const handleCastErrorDB = (err: any) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new appError(message, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new appError(message, 400);
};

const handleValidationErrorDB = (err: any) => {
    const errors = Object.values(err.errors).map((el: any) => el.message);

    const message = `Invalid input data. ${errors.join(". ")}`;
    return new appError(message, 400);
};

const handleJWTError = () =>
    new appError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
    new appError("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err: any, req: Request, res: Response) => {
    /** If the error occured for the API Request */
    if (req.originalUrl.startsWith(SERVICE_PREFIX)) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }

    /** Rendered to the website */
    console.error("ERROR 💥", err);
    return res.status(err.statusCode).render("error", {
        title: "Something went wrong!",
        msg: err.message,
    });
};

const sendErrorProd = (err: any, req: Request, res: Response) => {
    appLogger.error("ERROR 💥 : ",err);
    /** If the error occured for the API Request */
    if (req.originalUrl.startsWith(SERVICE_PREFIX)) {
        /** If operational, send message to the client */
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        /** Programming or other unknown error: don't leak error details **/
        console.error("ERROR 💥", err);
        return res.status(500).json({
            status: "error",
            message: "Something went very wrong!",
        });
    }

    /** Rendered to the website
     * If operational, send message to the client
     */
    if (err.isOperational) {
        return res.status(err.statusCode).render("error", {
            title: "Something went wrong!",
            msg: err.message,
        });
    }
    /** Programming or other unknown error: don't leak error details **/
    console.error("ERROR 💥", err);
    return res.status(err.statusCode).render("error", {
        title: "Something went wrong!",
        msg: "Please try again later.",
    });
};

const globalErrorHandler = (err: any,req: Request,res: Response, next: NextFunction) => {
    appLogger.error("ERROR 💥 : ",err);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        error.message = err.message;

        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === "ValidationError")
            error = handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError") error = handleJWTError();
        if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

        sendErrorProd(error, req, res);
    }
};

export default globalErrorHandler;
