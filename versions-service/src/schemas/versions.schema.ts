import mongoose from "mongoose";
import { object, string } from "zod";

export const createDocumentSchema = object({
    title: string({
        required_error: "Document title is required",
    }).min(1, "Document title cannot be empty"),
    folderId: string({}).refine((id) => {
        return (mongoose.Types.ObjectId.isValid(id));
    },
    { 
        message: "parent Folder Id is Invalid" 
    }),
    content: string({
        required_error: "Document content is required",
    }).min(1, "Document content cannot be empty"),
});

export const updateDocumentSchema =object({
    title: string().min(5, "Title cannot be empty and should be greater than 5 character").optional(),
    content: string().nullable().optional()
});