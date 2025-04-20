import multer from "multer";
import fs from "fs";

// Constants
// const ALLOWED_FILE_FORMATS = ["pdf", "docx", "xlsx", "csv", "txt", "jpeg", ""]; // Add/remove based on your need
const MAX_FILE_SIZE_MB = 5; // 5 MB limit

// Multer Storage
const multerStorage = multer.diskStorage({
    destination: (_1: any, _2: any, cb: Function) => {
        const folderPath = "./uploads";
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, folderPath);
    },
    filename: (_1: any, file: any, cb: Function) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

// Multer Filter
// const multerFilter = (req: any, file: any, cb: any) => {
//     const fileExtension = file.originalname.split(".").pop()?.toLowerCase();
//     if (!ALLOWED_FILE_FORMATS.includes(fileExtension || "")) {
//         cb(null, false);
//         return cb(new MulterExcelFileError("File type not allowed!"));
//     } else {
//         cb(null, true);
//     }
// };

// Multer Upload Instance
const fileUpload = multer({
    storage: multerStorage,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
    // fileFilter: multerFilter,
});

export { fileUpload };
