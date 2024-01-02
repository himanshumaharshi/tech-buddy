const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const { uploadImage } = require("../utils/imageUploader");

exports.updateProfile = async (req, res) => {
  try {
    // fetch data
    const { dateOfBirth = "", about = "", contactNumber, gender = "" } = req.body;

    // get userId
    const id = req.user.id;

    // find profile
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);

    // Update the profile fields
    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.contactNumber = contactNumber;
    profile.gender = gender;

    // Save the updated profile
    await profile.save();

    // return success response
    return res.status(200).json({
      success: true,
      message: "Profile updated Successfully",
      profile,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to Update Profile",
    });
  }
};

// deleteAccount function handler
exports.deleteAccount = async (req, res) => {
  try {
    // fetch account id
    const id = req.user.id;
    console.log("ID: ", id);

    // validation
    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // TODO(HW): unenroll user from all enrolled courses
    // const courseDetails = await Course.findById(id);
    // await Course.findByIdAndDelete({ _id: courseDetails.studentsEnrolled });

    // first delete profile
    await Profile.findByIdAndDelete({ _id: user.additionalDetails });

    // second delete user
    await User.findByIdAndDelete({ _id: id });

    // retrurn success response
    return res.status(200).json({
      success: true,
      message: "Account Deleted Successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to Delete Account",
    });
  }
};

// TODO: how can we schedule task -> delete account after 5 days
// TODO: find CRONJOB -> npm install cron

// getAll user details
exports.getAllUserDetails = async (req, res) => {
  try {
    // fetch user id
    const id = req.user.id;

    // validation and get user details
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();
    console.log(userDetails);

    // return success response
    return res.status(200).json({
      success: true,
      message: "User Details Fetched Successfully",
      data: userDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable to  Fetch User Details",
    });
  }
};

//updateDisplayPicture
exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    const image = await uploadImage(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log("Image: ", image);
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );
    res.send({
      success: true,
      message: "Image Updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "unable to update profile image",
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDetails = await User.findOne({
      _id: userId,
    })
      .populate("courses")
      .exec();
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      });
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Cannot get enrolled courses",
    });
  }
};
