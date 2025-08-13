import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to upload buffer to Cloudinary (simple)
export const uploadToCloudinary = async (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder: "rentdirect" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

export default upload;