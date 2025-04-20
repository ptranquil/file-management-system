import mongoose from "mongoose";

const FolderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        parentFolder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
            default: null,
        },
        path: {
            type: String,
            default: "",
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

FolderSchema.index({ userId: 1 });
FolderSchema.index({ parentFolder: 1 });
FolderSchema.index({ userId: 1, parentFolder: 1 });

const folderModel = mongoose.model("Folder", FolderSchema);
export default folderModel;
