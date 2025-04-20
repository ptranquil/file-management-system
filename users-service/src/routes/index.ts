import express from "express";
import { ValidateZod, verifyUser } from "filemanagement-utils";

import { userSchema, userLoginSchema } from "../schemas/user.schema";
import { healthCheck, login, signUp, updateUser } from "../controller/user.controller";

const appRouter = express.Router();

appRouter.get("/health-check", healthCheck);
appRouter.post("/login", ValidateZod(userLoginSchema), login);
appRouter.post("/signup", ValidateZod(userSchema), signUp);
appRouter.patch("/", verifyUser, updateUser);

export default appRouter;