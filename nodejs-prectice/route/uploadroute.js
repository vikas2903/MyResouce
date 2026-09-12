import express from 'express';
import { uploadVideo } from '../controller/videocontroller.js';
import upload from '../multer-middleware.js';
const uploadRoute = express.Router();
uploadRoute.post(
  '/upload',
  upload.any(),
  uploadVideo
);
export default uploadRoute;  
