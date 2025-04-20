import { Request, Response, NextFunction } from "express";
import _ from "lodash";

import apiSuccess, { callVersionService, checkObjectIdValidity } from "../utils/helper";
import folderModel from "../models/folder.model";
import mongoose from "mongoose";
import { appError, appLogger, catchAsync } from "filemanagement-utils";

export const healthCheck = catchAsync(async (req: Request, res: Response) => {
    appLogger.info("Server started");
    return apiSuccess(200, "Folder Service is Healthy!!!!!", res);
});

export const viewstore = catchAsync(async (_: Request, res: Response) => {
    const userId = res.locals.user.userId;
    const allFolders = await folderModel
        .find({ userId, parentFolder: null })
        .lean();
    return apiSuccess(200,"Folders fetched successfully", res, allFolders);
});

export const viewstoreById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {    
    const userId = res.locals.user.userId;
    const folderId = req.params.id;

    const folder = await checkObjectIdValidity(folderId, userId);

    /** Fetching the immediate next subfolder */
    const subfolders = await folderModel
        .find({ parentFolder: folderId, userId })
        .select("-updatedAt -__v")
        .lean();

    /** Fetching the document only for the given folder Id and not subfolders */
    const reqBody = {
        folderIds: [folderId]
    };

    const versionRes: any = await callVersionService('post',`${process.env.VERSION_SERVICE_BASE_URL}/getdocumentbyfolderids`,reqBody,next);
    if (!versionRes?.data) {
        return next(new appError("Document fetch failed", 500));
    }

    const documents = versionRes.data.data || [];

    const responseData = {
        folder: {
            _id: folder._id,
            name: folder.name,
            parentFolder: folder.parentFolder,
            userId: folder.userId
        },
        subfolders,
        documents
    };

    return apiSuccess(200,"Folder contents fetched successfully",res,responseData);
});

export const createFolder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.user.userId;
    const { name, parentFolder } = req.body;

    if (!name || name.trim() === "") {
        return next(new appError("Folder name is required", 400));
    }

    // If parentFolder is provided, validate its ObjectId and ownership
    let path = "/";
    let parent = null;
    if (parentFolder) {
        parent = await folderModel.findOne({ _id: parentFolder }).lean();
        if (!parent) {
            return next(new appError("folder not found", 404));
        }

        if (!parent.userId.equals(userId)) {
            return next(new appError("Access Denied", 403));
        }
        path = `${parent.path}${parent.name}/`;
    }

    // Check for duplicate folder name at the same level for the user
    const existingFolder = await folderModel.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") }, // case-insensitive match
        userId,
        parentFolder: parentFolder || null,
    });

    if (existingFolder) {
        return next(new appError("A folder with the same name already exists at this location",409));
    }

    const newFolder = await folderModel.create({
        name,
        userId,
        parentFolder: parentFolder || null,
        path,
    });

    return apiSuccess(201,"Folder created successfully",res,newFolder);
});

export const renameFolder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.user.userId;
    const folderId = req.params.id;
    const { newName } = req.body;

    const folder = await checkObjectIdValidity(folderId, userId);

    // Check for duplicate folder name under same parent
    const existing = await folderModel.findOne({
        userId,
        parentFolder: folder.parentFolder || null,
        name: newName.trim(),
        _id: { $ne: folderId },
    });

    if (existing) {
        return next(
            new appError(
                "A folder with this name already exists at this level",
                409
            )
        );
    }

    const oldName = folder.name;
    folder.name = newName.trim();

    if (folder.path) {
        const oldFullPath = `${folder.path}${oldName}/`;
        const newFullPath = `${folder.path}${newName.trim()}/`;

        await folderModel.updateMany( 
            { 
                userId,
                path: { $regex: `^${oldFullPath}` } },
            [
                {
                    $set: {
                        path: {
                            $replaceOne: {
                                input: "$path",
                                find: oldFullPath,
                                replacement: newFullPath,
                            },
                        },
                    },
                },
            ]
        );
    }

    folder.name = newName.trim();
    await folder.save();

    return apiSuccess(200, "Folder renamed successfully", res, folder);
});

export const deleteFolderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.user?.userId;
    const folderId = req.params.id;

    await checkObjectIdValidity(folderId, userId);

    const folderIdsToDelete: any = [];
    const collectFolderIds = async (id: any) => {
        folderIdsToDelete.push(id);
        const children = await folderModel.find({
            parentFolder: id,
            userId,
        });

        for (const child of children) {
            await collectFolderIds(child._id);
        }
    };

    await collectFolderIds(folderId);

    await folderModel.deleteMany({
        _id: { $in: folderIdsToDelete },
        userId,
    });

    return apiSuccess(200,"Folder and all its subfolders deleted successfully",res);
});

export const checkFoldersByUserId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, folderIds } = req.body;

    if (!Array.isArray(folderIds) || folderIds.length === 0) {
        return next(new appError("folderIds must be a non-empty array", 400));
    }

    const folders = await folderModel.find({
        _id: { $in: folderIds },
    });

    if (folders.length !== folderIds.length) {
        return next(new appError("Some folders not found", 404));
    }

    const unauthorized = folders.find((f) => !f.userId.equals(userId));
    if (unauthorized) {
        return next(
            new appError("Access denied for one or more folders", 403)
        );
    }

    return apiSuccess(200, "Folders fetched successfully", res, folders);
});

export const getAllFolderBelongsToUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const folders = await folderModel.find({ userId }).select("_id");
    const folderIds = folders.map(folder => folder._id);
    return apiSuccess(200, "Folders fetched successfully", res, folderIds);
});
  