import express from "express";
import fs from "fs";
import path from "path";
import upload from "../multer-middleware.js";

const fileUpLoadWithRestriction = express.Router();

fileUpLoadWithRestriction.post("/upload", upload.array("file", 10), (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).send({ message: "Please upload file(s) using the field name 'file'" });
    }

    const invalidFile = files.find((file) => file.mimetype !== "image/jpeg" && file.mimetype !== "image/png");

    const fileSizeLimit = 5 * 1024 * 1024; // 1MB
    const oversizedFile = files.find((file) => file.size > fileSizeLimit);

    if (oversizedFile) {
        return res.status(400).send({
            message: "File size exceeds the limit of 5MB",
            file: oversizedFile.originalname
        });
    }

    if (invalidFile) {
        return res.status(400).send({
            message: "Invalid file type. Only JPG and PNG are allowed.",
            file: invalidFile.originalname
        });
    }

    const uploadDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadPromises = files.map((file) => {
        const filePath = path.join(uploadDir, file.originalname);

        return fs.promises.writeFile(filePath, file.buffer).then(() => ({
            file: file.originalname,
            mimetype: file.mimetype
        }));
    });

    Promise.all(uploadPromises)
        .then((uploadedFiles) => {
            return res.status(200).send({
                message: "File uploaded successfully",
                files: uploadedFiles
            });
        })
        .catch(() => {
            return res.status(500).send({ message: "File upload failed" });
        });
});

export default fileUpLoadWithRestriction;