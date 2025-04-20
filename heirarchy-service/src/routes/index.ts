import express from "express";

import { checkFoldersByUserId, createFolder, deleteFolderById, getAllFolderBelongsToUser, healthCheck, renameFolder, viewstore, viewstoreById } from "../controller/folder.controller";
import { createFolderSchema, renameFolderSchema } from "../schemas/folder.schema";
import { ValidateZod, verifyInternalRequest, verifyUser } from "filemanagement-utils";

const appRouter = express.Router();

appRouter.get("/health-check", healthCheck);
appRouter.get("/viewstore", verifyUser, viewstore);
appRouter.get("/viewstore/:id", verifyUser, viewstoreById);
appRouter.post("/folder", verifyUser, ValidateZod(createFolderSchema), createFolder);
appRouter.put("/folder/:id", verifyUser, ValidateZod(renameFolderSchema), renameFolder);
appRouter.delete("/folder/:id", verifyUser, deleteFolderById);

/** Internal micro services call */
appRouter.post("/checkfolder", verifyInternalRequest, checkFoldersByUserId);
appRouter.post("/getfolderids/:userId", verifyInternalRequest, getAllFolderBelongsToUser);

export default appRouter;