import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IVersion extends MongooseDocument {
    documentId: mongoose.Types.ObjectId;
    version: string;
    filePath: string;
    uploadedBy: string;
    createdAt: Date; 
    updatedAt: Date;
}

const VersionSchema: Schema = new Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true,
        },
        version: {
            type: String,
            required: true,
        },
        fileUrl: {
            type: String,
            required: true,
        }
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

VersionSchema.index({ documentId: 1});

const versionModel = mongoose.model<IVersion>("Version", VersionSchema);
export default versionModel;
