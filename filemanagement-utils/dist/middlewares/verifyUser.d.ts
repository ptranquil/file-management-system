import { NextFunction, Request, Response } from "express";
declare const verifyUser: (req: Request, res: Response, next: NextFunction) => void;
export { verifyUser };
