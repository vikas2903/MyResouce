import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import Video from "../modals/video.js";

const findUploadedFile = (files, fieldNames) => {
  if (!files) {
    return undefined;
  }

  if (Array.isArray(files)) {
    return files.find((file) => fieldNames.includes(file.fieldname));
  }

  for (const fieldName of fieldNames) {
    const matchingFile = files[fieldName]?.[0];
    if (matchingFile) {
      return matchingFile;
    }
  }

  return undefined;
};

const findUploadedFileByType = (files, typePrefix) => {
  if (!files) {
    return undefined;
  }

  if (Array.isArray(files)) {
    return files.find((file) => file.mimetype?.startsWith(typePrefix));
  }

  for (const fileList of Object.values(files)) {
    const matchingFile = fileList?.find((file) =>
      file.mimetype?.startsWith(typePrefix)
    );

    if (matchingFile) {
      return matchingFile;
    }
  }

  return undefined;
};

const uploadToCloudinary = (file, resourceType) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });

export const uploadVideo = async (req, res) => {
  try {
    const videoFile =
      req.file ||
      findUploadedFile(req.files, ["video", "videoFile", "file"]) ||
      findUploadedFileByType(req.files, "video/");
    const thumbnailFile =
      findUploadedFile(req.files, ["thumbnail", "thumb", "image"]) ||
      findUploadedFileByType(req.files, "image/");
    const { title, description, isActive } = req.body || {};

    if (!videoFile) {
      return res.status(400).json({ error: "Video file is required" });
    }

    const videoUpload = await uploadToCloudinary(videoFile, "video");

    let thumbnailUrl = videoUpload.secure_url.replace(/\.[^/.]+$/, ".jpg");

    if (thumbnailFile) {
      const thumbnailUpload = await uploadToCloudinary(thumbnailFile, "image");
      thumbnailUrl = thumbnailUpload.secure_url;
    }

    const videoPayload = {
      title: title || videoFile.originalname || "Untitled video",
      description: description || "No description provided",
      url: videoUpload.secure_url,
      thumbnail: thumbnailUrl,
      isActive: isActive === undefined ? true : isActive,
    };

    const savedVideo = await Video.create(videoPayload);

    return res.status(201).json({
      message: "Video uploaded successfully",
      video: savedVideo,
    });
  } catch (error) {
    console.log("Error in videoController file", error.message);
    return res
      .status(500)
      .json({ error: "An error occurred while uploading the video" });
  }
};
