import { v2 as cloudinary } from 'cloudinary'
import ErrorResponse from "../utils/ErrorResponse.js";
import asyncWrapper from '../utils/asyncWrapper.js';

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDAPISECRET,
  secure_url: true,
});

const cloudUploader = asyncWrapper(async (req, res, next) => {
  const { name } = req.body;

  // If no file uploaded, continue without error (for optional uploads)
  if (!req.file) {
    return next();
  }

  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

  const cloudinaryData = await cloudinary.uploader.upload(dataURI, {
    resource_type: 'auto',
    public_id: name || `upload_${Date.now()}`,
  });

  req.cloudinaryURL = cloudinaryData.secure_url;

  next();
})

export default cloudUploader;