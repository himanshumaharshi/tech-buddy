const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImage } = require("../utils/imageUploader");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");
const { convertSecondsToDuration } = require("../utils/secToDuration");

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
      // tag:_tag,
      tag,
      category,
      status,
      instructions,
      // instructions:_instructions,
      whatYouWillLearn,
    } = req.body;

    // get thumbnail
    const thumbnail = req.files.thumbnailImage;

    // console.log("body: ", req.body)

    // validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      // !tag.length ||
      !thumbnail ||
      !category
      // !instruction.length
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
          courses: newCourse._id,
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

// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update");
      const thumbnail = req.files.thumbnailImage;
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }

    await course.save();

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
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

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// fetchCourse handler function
exports.getAllCourses = async (req, res) => {
  try {
    // fetch data
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
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
// exports.getCourseDetails = async (req, res) => {
//   try {
//     // get courseId
//     const { courseId } = req.body;

//     // find courseDetails
//     const courseDetails = await Course.find({ _id: courseId })
//       .populate({
//         path: "instructor",
//         populate: {
//           path: "additionalDetails",
//         },
//       })
//       .populate("category")
//       .populate("ratingAndReviews")
//       .populate({
//         path: "courseContent",
//         populate: {
//           path: "subSection",
//         },
//       })
//       .exec();

//     // validate fetched data
//     if (!courseDetails) {
//       return res.status(404).json({
//         success: false,
//         message: `No Course Details found for courseId: ${courseId}.`,
//       });
//     }

//     // return success response
//     return res.status(200).json({
//       success: true,
//       message: `Course Details fetched successfully for courseId: ${courseId}.`,
//       data: courseDetails,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Unable to Fetch Course Details",
//     });
//   }
// };
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
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
          select: "-videoUrl",
        },
      })
      .exec();

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// full course details
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
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

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    console.log("courseProgressCount : ", courseProgressCount);

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id;

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 });

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    });
  }
};

// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled;
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      });
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent;
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId);
      if (section) {
        const subSections = section.subSection;
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId);
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId);
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
