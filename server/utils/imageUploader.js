const cloudinary = require("cloudinary").v2;

// upload image to cloudinary
exports.uploadImage = async (file, folder, height, qulaity) => {
  const options = { folder };
  if (height) {
    options.height = height;
  }
  if (qulaity) {
    options.quality = qulaity;
  }
  options.resource_type = "auto";
  return await cloudinary.uploader.upload(file.tempFilePath, options);
};
