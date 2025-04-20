import express from "express";

import { healthCheck, createDocument, getDocumentById, createDocumentVersion, getAllDocumentVersions, updateDocument, deleteDocument, filterDocuments, getTotalDocuments, getDocumentsByFolderIds } from "../controller/document.controller";
import { fileUpload } from "../utils/multer";
import { createDocumentSchema, updateDocumentSchema } from "../schemas/versions.schema";
import { ValidateZod, verifyInternalRequest, verifyUser } from "filemanagement-utils";

const appRouter = express.Router();

appRouter.get("/health-check", healthCheck);

/** API for internal microservice call */
appRouter.post('/documents/getdocumentbyfolderids', verifyInternalRequest, getDocumentsByFolderIds);

appRouter.post('/documents', verifyUser, fileUpload.single("file"), ValidateZod(createDocumentSchema), createDocument);
appRouter.get('/documents/filter', verifyUser, filterDocuments);
appRouter.get('/documents/total-documents', verifyUser, getTotalDocuments);
appRouter.get('/documents/:documentId', verifyUser, getDocumentById);
appRouter.post('/documents/:documentId/version', verifyUser, fileUpload.single("file"), createDocumentVersion);
appRouter.get('/documents/:documentId/version', verifyUser, getAllDocumentVersions);
appRouter.put('/documents/:documentId', verifyUser, ValidateZod(updateDocumentSchema), updateDocument);
appRouter.delete('/documents/:documentId', verifyUser, deleteDocument);

export default appRouter;