
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const uploadDir = path.resolve(
  currentDir,
  "../../private-uploads/account-documents"
);

fs.mkdirSync(uploadDir, { recursive: true });

const allowedExtensions = new Set([
  ".pdf", ".png", ".jpg", ".jpeg", ".webp",
  ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },

  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const uploadAccountDocument = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      return callback(
        new Error("Unsupported file type. Upload PDF, image, Office, CSV or TXT files.")
      );
    }

    callback(null, true);
  },
});

export { uploadDir };
export default uploadAccountDocument.single("file");
