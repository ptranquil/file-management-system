import { NextFunction, Request, Response } from "express";
declare const ValidateZod: (schema: any) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default ValidateZod;
