import axios from "axios";
import { NextFunction } from "express";
import mongoose from "mongoose";
import { appError } from "filemanagement-utils";

import folderModel from "../models/folder.model";

const apiSuccess = ( statusCode: number, message: string, res: any, data: any = "") => {
    const response: { status: boolean; message: string; data?: any;} = {
        status: true,
        message,
    };

    if (data) response.data = data;
    return res.status(statusCode).json(response);
};

export async function checkObjectIdValidity(folderId:string, userId: string){
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
        throw new appError("Invalid folder ID", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new appError("Invalid user ID", 400);
    }

    const folder = await folderModel.findOne({ _id: folderId });
    if (!folder) {
        throw  new appError("folder not found", 404);
    }

    if (!folder.userId.equals(userId)) {
        throw  new appError("Access Denied", 403);
    }

    return folder;
}

export const callVersionService = async (method: string, url: string, body: {}, next: NextFunction ) => {
    let requestConfig = {
        method: method,
        url,
        headers: {
            "x-internal-token": process.env.INTERNAL_SECRET!,
        },
        data: body,
    }
    try {
        const response = await axios(requestConfig);
        return response;
    } catch (err: any) {
        if (err.status === 403) {
            throw(new appError("You are not authorized to access these folders", 403));
        }
        throw(new appError("Failed to validate folders from Version service", 400));
    }
}

export default apiSuccess;
