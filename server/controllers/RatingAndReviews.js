const RatingAndReviews = require("../models/RatingAndReviews");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// createRating
exports.createRating = async (req, res) => {
  try {
    // get user id
    const userId = req.user.id;

    // fetchdata from req body
    const { rating, review, courseId } = req.body;

    // check if user is enrolled or not
    const courseDetails = await Course.findById({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    // validate course details
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in the course",
      });
    }

    // check if user already reviewed the course or not
    const alreadyReviewed = await RatingAndReviews.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Already Reviewed by user",
      });
    }

    // create rating and review
    const ratingReview = await RatingAndReviews.create({
      rating,
      review,
      coutse: courseId,
      user: userId,
    });

    // update course with this rating/review
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { courseId },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );
    console.log(updatedCourseDetails);

    // return success response
    return res.status(200).json({
      success: true,
      message: "Rating Created Successfully",
      data: ratingReview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Connot Create Rating",
    });
  }
};

// getAverageRating
exports.getAverageRating = async (req, res) => {
  try {
    // fetch course id
    const courseId = req.body.courseId;

    // calculate average rating
    const result = await RatingAndReviews.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);

    if (result.length > 0) {
      // return rating and success response
      return res.status(200).json({
        success: true,
        message: "Average Rating Fetched",
        averageRating: result[0].averageRating,
      });
    }

    // rating does not exist
    return res.status(404).json({
      success: false,
      message: "No Rating Available",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error Fetching Average Rating",
    });
  }
};

// getAllRatingAndReviews
exports.getAllRating = async (req, res) => {
  try {
    // get courseId
    const allReviews = await RatingAndReviews.find({})
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
      message: "All Rating fetched successfully",
      data: allReviews,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Connot Fetch All Rating",
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
