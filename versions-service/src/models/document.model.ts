import mongoose, { Schema, Document as MongooseDocument } from "mongoose";

export interface IDocument extends MongooseDocument {
    title: string;
    folderId: string;
    content: string;
    createdAt: Date; 
    updatedAt: Date;
}

const DocumentSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
    },
    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Folder",
    },
    content: {
        type: String,
        required: false,
        default: "",
    }
},{
    timestamps: true,
    versionKey: false
});

DocumentSchema.index({ folderId: 1});

const documentModel = mongoose.model<IDocument>("Document", DocumentSchema);
export default documentModel;
