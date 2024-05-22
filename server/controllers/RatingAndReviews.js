const RatingAndReviews = require("../models/RatingAndReviews");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// createRating
exports.createRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, review, courseId } = req.body;

    // Check if the user is enrolled in the course

    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in this course",
      });
    }

    // Check if the user has already reviewed the course
    const alreadyReviewed = await RatingAndReviews.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course already reviewed by user",
      });
    }

    // Create a new rating and review
    const ratingReview = await RatingAndReviews.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    // Add the rating and review to the course
    await Course.findByIdAndUpdate(courseId, {
      $push: {
        ratingAndReviews: ratingReview,
      },
    });
    await courseDetails.save();

    return res.status(201).json({
      success: true,
      message: "Rating and review created successfully",
      ratingReview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// getAverageRating
exports.getAverageRating = async (req, res) => {
  try {
    const courseId = req.body.courseId;

    // Calculate the average rating using the MongoDB aggregation pipeline
    const result = await RatingAndReviews.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId), // Convert courseId to ObjectId
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    // If no ratings are found, return 0 as the default rating
    return res.status(200).json({ success: true, averageRating: 0 });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve the rating for the course",
      error: error.message,
    });
  }
};

// getAllRatingAndReviews
exports.getAllRatingReview = async (req, res) => {
  try {
    const allReviews = await RatingAndReviews.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image", // Specify the fields you want to populate from the "Profile" model
      })
      .populate({
        path: "course",
        select: "courseName", //Specify the fields you want to populate from the "Course" model
      })
      .exec();

    res.status(200).json({
      success: true,
      data: allReviews,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve the rating and review for the course",
      error: error.message,
    });
  }
};

// fetch all rating and reviews on basis of courseId
exports.courseRating = async (req, res) => {
  try {
    // get courseId
    const courseId = req.body.courseId;

    // fetch course Rating
    const courseRating = await RatingAndReviews.findById(courseId)
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    // return success response
    return res.status(200).josn({
      success: true,
      message: "Course Rating successfully",
      data: allReviews,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Connot Fetch Course Rating",
    });
  }
};
