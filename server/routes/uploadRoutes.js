import express from "express";
import multer from "multer";
import sharp from "sharp";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Store the original upload in memory — we compress it
// ourselves before sending it up to Cloudinary.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    // Generous cap for real phone photos — the actual stored
    // file ends up much smaller after compression below.
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Uploads a buffer to Cloudinary using its stream API, since we
// already have the image in memory rather than on disk.
const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "bookbeautiq", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

router.post("/", authMiddleware, roleMiddleware("business", "admin"), (req, res) => {
  upload.single("image")(req, res, async (error) => {
    if (error) {
      console.error("Image upload error:", error);

      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "Image is too large. Please upload a photo under 10MB."
          : error.message || "Image upload failed.";

      return res.status(400).json({ message });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded.",
      });
    }

    try {
      // Resize to a sensible max width and compress to high-quality
      // JPEG — keeps images sharp while cutting file size dramatically
      // compared to an untouched phone photo.
      const compressedBuffer = await sharp(req.file.buffer)
        .rotate() // respects EXIF orientation from phone cameras
        .resize({ width: 1600, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const result = await uploadBufferToCloudinary(compressedBuffer);

      res.status(201).json({
        message: "Image uploaded successfully.",
        imageUrl: result.secure_url,
      });
    } catch (processingError) {
      console.error("Image processing error:", processingError);
      res.status(500).json({
        message: "Failed to process image.",
      });
    }
  });
});

export default router;