import { NextFunction, Request, Response } from "express";
declare const globalErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
export default globalErrorHandler;
