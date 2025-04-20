import mongoose from "mongoose";
import { object, string } from "zod";

export const createFolderSchema = object({
    name: string({
        required_error: "Folder name is required",
        invalid_type_error: "Folder name is Invalid, must be a string",
    }).min(1, "Folder name cannot be empty"),
    parentFolder: string()
        .nullable()
        .optional()
        .refine(
            (value) => {
                return (
                    !value ||
                    value === null ||
                    value === undefined ||
                    mongoose.Types.ObjectId.isValid(value)
                );
            },
            {
                message: "parent Folder Id is Invalid",
            }
        ),
});

export const renameFolderSchema = object({
    newName: string({
        required_error: "New folder name is required",
    }).min(1, "New folder name cannot be empty"),
});