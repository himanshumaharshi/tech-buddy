const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImage } = require("../utils/imageUploader");

// createCourse handler function
exports.createCourse = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id;

    // fetch data from req.body
    let {
      courseName,
      courseDescription,
      price,
      tag,
      category,
      status,
      instructions,
      whatYouWillLearn,
    } = req.body;

    // get thumbnail
    const thumbnail = req.files.thumbnailImage;

    // validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required to create a new Course",
      });
    }
    if (!status || status === undefined) {
      status = "Draft";
    }

    // TODO: verify that userId and instructorDetails._id are same or different?

    // Check if the user is an instructor
    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    });

    // if no instructor data is available
    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    // Category validation
    const categoryDetails = await Category.findById(category);

    // invalid Category
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category details not found",
      });
    }

    // upload image to cloudinary
    const thumbnailImage = await uploadImage(
      thumbnail,
      process.env.FOLDER_NAME
    );
    console.log(thumbnailImage);

    // create course entry for new course in database
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status: status,
      instructions: instructions,
    });

    // add new course to the user schema of the instructor
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // Add the new course to the Categories
    await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          course: newCourse._id,
        },
      },
      { new: true }
    );

    // return success response
    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
      data: newCourse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

// fetchCourse handler function
exports.getAllCourses = async (req, res) => {
  try {
    // fetch data
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnroled: true,
      }
    )
      .populate("instructor")
      .exec();
    return res.status(200).json({
      success: true,
      message: "Fetched Course Data Successfully: ",
      data: allCourses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course data",
      error: error.message,
    });
  }
};

//getCourseDetails
exports.getCourseDetails = async (req, res) => {
  try {
    // get courseId
    const { courseId } = req.body;

    // find courseDetails
    const courseDetails = await Course.find({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    // validate fetched data
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `No Course Details found for courseId: ${courseId}.`,
      });
    }

    // return success response
    return res.status(200).json({
      success: true,
      message: `Course Details fetched successfully for courseId: ${courseId}.`,
      data: courseDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Unable to Fetch Course Details",
    });
  }
};
