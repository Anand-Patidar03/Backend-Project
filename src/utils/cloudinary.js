import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary config (run once)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Exported function
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File uploaded successfully");

    // remove file from local storage after upload
    fs.unlinkSync(localFilePath);

    return uploadResult;

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    fs.unlinkSync(localFilePath); // cleanup
    return null;
  }
};

export { uploadOnCloudinary };
