import express from "express";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../uploads");

// Store the original upload in memory — we compress it
// ourselves before writing anything to disk.
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
      const uniqueName =
        Date.now() + "-" + Math.round(Math.random() * 1e9) + ".jpg";

      const outputPath = path.join(uploadsDir, uniqueName);

      // Resize to a sensible max width and compress to high-quality
      // JPEG — keeps images sharp while cutting file size dramatically
      // compared to an untouched phone photo.
      await sharp(req.file.buffer)
        .rotate() // respects EXIF orientation from phone cameras
        .resize({ width: 1600, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(outputPath);

      const imageUrl = `/uploads/${uniqueName}`;

      res.status(201).json({
        message: "Image uploaded successfully.",
        imageUrl,
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
