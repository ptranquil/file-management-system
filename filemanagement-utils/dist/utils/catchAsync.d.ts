import { Request, Response, NextFunction } from "express";
declare const catchAsync: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export default catchAsync;
