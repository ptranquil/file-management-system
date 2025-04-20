import multer from "multer";
import fs from "fs";

const MAX_FILE_SIZE_MB = 50; // 50 MB limit

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

// Multer Upload Instance
const fileUpload = multer({
    storage: multerStorage,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

export { fileUpload };
