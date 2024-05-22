const { default: mongoose } = require("mongoose");
const { instance } = require("../config/razorpay");
const crypto = require("crypto");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const {
  paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");

// capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.userId;

  // if course not found
  if (courses.length === 0) {
    return res.json({
      success: false,
      message: "Please Provide valid course id",
    });
  }

  let totalAmount = 0;
  for (const course_id of courses) {
    let course;
    try {
      course = await Course.findById(course_id);

      if (!course) {
        return res.status(200).json({
          success: false,
          message: "could not find the course",
        });
      }

      // Check if the user is already enrolled in the course or not
      const uId = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uId)) {
        return res.status(200).json({
          success: false,
          message: "Student is already enrolled",
        });
      }

      // Add the price of the course to the total amount
      totalAmount += course.price;
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: Math.random(Date.now()).toString(),
    };

    try {
      const paymentResponse = await instance.orders.create(options);
      console.log(paymentResponse);
      res.json({
        success: true,
        data: paymentResponse,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Could not initiate order." });
    }
  }
};

// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const courses = req.body?.courses;

  const userId = req.user.id;

  // if any of these are not found
  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({
      success: false,
      message: "Payment Failed",
    });
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // enroll student
    await enrollStudents(courses, userId, res);

    // return success response
    return res.status(200).json({
      success: true,
      message: "Payment verified",
    });
  }

  return res.status(200).json({
    success: false,
    message: "Payment Failed",
  });
};

// enroll student
const enrollStudents = async (courses, userId, res) => {
  try {
    if (!courses || !userId) {
      return res.status(400).json({
        success: false,
        message: "Please Provide Course ID and User ID",
      });
    }

    for (const courseId of courses) {
      // find the course and enroll the student
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" });
      }

      console.log("Updated course: ", enrolledCourse);

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });

      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      console.log("Enrolled student: ", enrolledStudent);

      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      );
      console.log("Email sent successfully: ", emailResponse.response);
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" });
  }

  try {
    const enrolledStudent = await User.findById(userId);

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("error in sending mail", error);
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" });
  }
};
