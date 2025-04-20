import { NextFunction, Request, Response } from "express";
declare const verifyInternalRequest: (req: Request, res: Response, next: NextFunction) => void;
export { verifyInternalRequest };
