import { Request, Response, NextFunction } from "express";

import documentModel, { IDocument } from "../models/document.model";
import versionModel from "../models/version.model";
import {apiSuccess, callHeirarchyService} from "../utils/helper";
import path from "path";
import mongoose from "mongoose";
import { appError, appLogger, catchAsync } from "filemanagement-utils";

export const healthCheck = catchAsync(
    async (_: Request, res: Response) => {
        appLogger.info("Server started");
        return apiSuccess(200, "Version Service is Healthy!!!!!", res);
    }
);

/** Function to create the document structure with version if file is passed */
export const createDocument = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const { title, folderId, content } = req.body;
    const file = req.file;
    const userId = res.locals.user?.userId;

    const reqBody = {
        userId: userId,
        folderIds: [folderId],
    }

    const hierarchyRes: any = await callHeirarchyService('post', `${process.env.HIERARCHY_SERVICE_BASE_URL}/checkfolder`, reqBody);
    if (!hierarchyRes.data || !hierarchyRes.data.data || hierarchyRes.data.data.length === 0) {
        return next(new appError("Folder not found", 404))
    }

    const document = await documentModel.create({
        title,
        folderId,
        content
    });

    // If file is uploaded, creating version 1.0 or updating new version
    if (file) {
        const latestVersion = await versionModel.findOne({ documentId: document._id }).sort({ createdAt: -1 });
        let version = "1.0"; // default if no previous version
        if (latestVersion) {
            const currentVersion = parseFloat(latestVersion.version);
            version = (currentVersion + 1.0).toFixed(1);
        }
        const fileUrl = `${process.env.BASE_URL}/uploads/${file.filename}`;

        await versionModel.create({
            documentId: document._id,
            version,
            fileUrl,
        });
    }
    return apiSuccess(201, "Document created successfully", res,{documentId: document._id});
});

export const getDocumentById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { documentId } = req.params;
    const userId = res.locals.user?.userId;

    if(!mongoose.Types.ObjectId.isValid(documentId)){
        return next(new appError("Invalid DocumentId", 400));
    }

    // Fetch the document by ID
    const document: any = await documentModel.findById(documentId);
    if (!document) {
        return next(new appError("Document not found", 404));
    }

    // Check if the folder belongs to the user by calling the hierarchy service (to check folder ownership)
    const reqBody = {
        userId: userId,
        folderIds: [document.folderId],
    }
    const hierarchyRes: any = await callHeirarchyService('post', `${process.env.HIERARCHY_SERVICE_BASE_URL}/checkfolder`, reqBody);
    if (!hierarchyRes.data || !hierarchyRes.data.data || hierarchyRes.data.data.length === 0) {
        return next(new appError("You are not authorized to access this folder", 403));
    }

    const versions = await versionModel.find({ documentId });
    const response = {
        _id: document._id,
        title: document.title,
        folderId: document.folderId,
        content: document.content,
        createdAt: document.createdAt,
        versions: versions,
    };

    return apiSuccess(200, "Document fetched successfully", res, response); // Success response
});

/** Function to create the new version of the file to the specific decoumet */
export const createDocumentVersion = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const documentId = req.params?.documentId;
    const file = req.file;
    const userId = res.locals.user?.userId;

    if (!file) {
        return next(new appError("File is required to create a new version", 400));
    }

    const document = await documentModel.findById(documentId);
    if (!document) {
        return next(new appError("Document not found", 404));
    }

    const reqBody = {
        userId: userId,
        folderIds: [document.folderId],
    }
    const hierarchyRes: any = await callHeirarchyService('post', `${process.env.HIERARCHY_SERVICE_BASE_URL}/checkfolder`, reqBody);
    if (!hierarchyRes.data || !hierarchyRes.data.data || hierarchyRes.data.data.length === 0) {
        return next(new appError("You are not authorized to access this folder", 403));
    }

    const latestVersion = await versionModel.findOne({ documentId: document._id }).sort({ createdAt: -1 });
    let version = "1.0";
    if (latestVersion) {
        const currentVersion = parseFloat(latestVersion.version);
        version = (currentVersion + 1.0).toFixed(1);
    }

    const fileUrl = `${process.env.BASE_URL}/uploads/${file.filename}`;
    await versionModel.create({
        documentId: document._id,
        version,
        fileUrl,
    });
    return apiSuccess(201, "Document version created successfully", res);
});

export const getAllDocumentVersions = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const { documentId } = req.params;
    const userId = res.locals.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
        return next(new appError("Invalid DocumentId", 400));
    }

    const document: IDocument | null = await documentModel.findById(documentId);
    if (!document) {
        return next(new appError("Document not found", 404));
    }

    const reqBody = {
        userId: userId,
        folderIds: [document.folderId],
    }
    const hierarchyRes: any = await callHeirarchyService('post', `${process.env.HIERARCHY_SERVICE_BASE_URL}/checkfolder`, reqBody);
    if (!hierarchyRes.data || !hierarchyRes.data.data || hierarchyRes.data.data.length === 0) {
        return next(new appError("You are not authorized to access this folder", 403));
    }

    const versions = await versionModel.find({ documentId }).sort({ createdAt: -1 });

    if (versions.length === 0) {
        return next(new appError("No versions found for this document", 404));
    }

    const response = versions.map((version: any) => ({
        version: version.version,
        fileUrl: version.fileUrl,
        uploadedAt: version.createdAt,
    }));

    return apiSuccess(200, "Document versions fetched successfully", res, response);
});

export const updateDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { documentId } = req.params;
    const title =  req.body?.title;
    const content =  req.body?.content;
    const userId = res.locals.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
        return next(new appError("Invalid DocumentId", 400));
    }

    const document: IDocument | null = await documentModel.findById(documentId);
    if (!document) {
        return next(new appError("Document not found", 404));
    }

    const reqBody = {
        userId: userId,
        folderIds: [document.folderId],
    }
    const hierarchyRes: any = await callHeirarchyService('post', `${process.env.HIERARCHY_SERVICE_BASE_URL}/checkfolder`, reqBody);
    if (!hierarchyRes.data || !hierarchyRes.data.data || hierarchyRes.data.data.length === 0) {
        return next(new appError("You are not authorized to access this folder", 403));
    }

    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;
    await document.save();

    const updatedDocument = {
        _id: document._id,
        title: document.title,
        content: document.content,
        folderId: document.folderId,
    };

    return apiSuccess(200, "Document updated successfully", res, updatedDocument);
});

export const deleteDocument = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { documentId } = req.params;
    const userId = res.locals.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
        return next(new appError("Invalid document ID", 400));
    }

    const document = await documentModel.findById(documentId);
    if (!document) {
        return next(new appError("Document not found", 404));
    }

    const reqBody = {
        userId: userId,
        folderIds: [document.folderId],
    }
    const hierarchyRes: any = await callHeirarchyService('post', `${process.env.HIERARCHY_SERVICE_BASE_URL}/checkfolder`, reqBody);
    if (!hierarchyRes.data || !hierarchyRes.data.data || hierarchyRes.data.data.length === 0) {
        return next(new appError("You are not authorized to access this folder", 403));
    }

    await versionModel.deleteMany({ documentId });

    await document.deleteOne();

    return apiSuccess(200, "Document and all versions deleted successfully", res);
});

// export const filterDocuments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const search = req.query.search as string;
//     const userId = res.locals.user?.userId;

//     const query: any = {
//         $or: [
//             { title: new RegExp(search, 'i') },
//             { content: new RegExp(search, 'i') },
//         ]
//     };

//     const documents = await documentModel.find(query).select("_id title folderId");
//     const folderIds = [...new Set(documents.map((doc: any) => doc.folderId.toString()))];

//     if(folderIds.length){ 

//         let folderPathMap: Record<string, string> = {};

//         const reqBody = {
//             userId: userId,
//             folderIds: folderIds,
//         }
//         const hierarchyRes: any = await callHeirarchyService('post', `${process.env.HIERARCHY_SERVICE_BASE_URL}/checkfolder`, reqBody);
//         if (!hierarchyRes.data || !hierarchyRes.data.data || hierarchyRes.data.data.length === 0) {
//             return next(new appError("You are not authorized to access this folder", 403));
//         }

//         folderPathMap = hierarchyRes.data.data.reduce((acc: any, folder: any) => {
//             acc[folder._id] = folder.path;
//             return acc;
//         }, {});

//         const result = documents.map((doc: any) => ({
//             id: doc._id,
//             title: doc.title,
//             folderPath: folderPathMap[doc.folderId.toString()] || "",
//         }));

//         return apiSuccess(200, "Documents filtered successfully", res, result);
//     } else {
//         return apiSuccess(200, "Documents filtered successfully", res, []);
//     }
// });


export const filterDocuments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const search = req.query.search as string;
    const userId = res.locals.user?.userId;

    let folders = [];
    const hierarchyRes: any = await callHeirarchyService('get', `${process.env.HIERARCHY_SERVICE_BASE_URL}/getfolderids/${userId}`, {});
    if (!hierarchyRes.data) {
        return next(new appError("Failed to fetch folders from hierarchy service", 400));
    }
    folders  = hierarchyRes?.data?.data;

    if (!folders || folders.length === 0) {
        return apiSuccess(200, "Documents filtered successfully", res, []);
    }

    const folderIds = folders.map((folder: any) => folder._id);
    const folderPathMap = folders.reduce((acc: any, folder: any) => {
        acc[folder._id] = folder.path;
        return acc;
    }, {});

    const query: any = {
        $or: [
            { title: new RegExp(search, 'i') },
            { content: new RegExp(search, 'i') },
        ],
        folderId: { $in: folderIds },
    };

    const documents = await documentModel.find(query).select("_id title folderId");

    if (documents.length === 0) {
        return apiSuccess(200, "Documents filtered successfully", res, []);
    }

    const result = documents.map((doc: any) => ({
        id: doc._id,
        title: doc.title,
        folderPath: folderPathMap[doc.folderId.toString()] || "",
    }));

    return apiSuccess(200, "Documents filtered successfully", res, result);
});


export const getTotalDocuments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.user?.userId;

    const hierarchyRes: any = await callHeirarchyService('get', `${process.env.HIERARCHY_SERVICE_BASE_URL}/getfolderids/${userId}`, {});
    if (!hierarchyRes.data || !hierarchyRes.data.data) {
        return next(new appError("Failed to fetch folders from hierarchy service", 400));
    }

    const folderIds = hierarchyRes.data.data.map((folder: any) => folder._id);
    const totalDocuments = await documentModel.countDocuments({
        folderId: { $in: folderIds }
    });

    return apiSuccess(200, "Total documents fetched successfully", res, {
        totalDocuments,
    });
});


export const getDocumentsByFolderIds = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { folderIds } = req.body;

    if (!Array.isArray(folderIds) || folderIds.length === 0) {
        return next(new appError("folderIds must be a non-empty array", 400));
    }

    const validFolderIds = folderIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validFolderIds.length !== folderIds.length) {
        return next(new appError("One or more folderIds are invalid", 400));
    }

    const documents = await documentModel
        .find({ folderId: { $in: validFolderIds } })
        .lean();

    return apiSuccess(200, "Documents fetched successfully", res, documents);
});