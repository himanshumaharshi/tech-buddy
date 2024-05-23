const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");

// capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
  // try {
  // get courseId and UserId
  const { courseId } = req.body;
  const userId = req.user.id;

  // validate courseId
  if (!courseId) {
    return res.status(404).json({
      success: false,
      message: "Please provide a valid course id",
    });
  }

  // validate courseDetails
  let course;
  try {
    course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Please provide valid Course Details",
      });
    }
    // user already payed for the same course?
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(400).json({
        success: false,
        message: "Student is already enrolled in this Course.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User already enrolled in course.",
      message: error.message,
    });
  }

  // create order
  const amount = course.price;
  const currency = "INR";
  const options = {
    amount: amount * 100,
    currency,
    reciept: Math.random(Date.now()).toString(),
    notes: {
      courseId: courseId,
      userId,
    },
  };

  // function call to initiate the payment request
  try {
    // initialte the payment using razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);

    // return success response
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.description,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Cannot Initiate Razorpay Order",
      message: error.message,
    });
  }
  // } catch (error) {
  //   console.error(error);
  //   return res.status(500).json({
  //     success: false,
  //     message: "Error creating Razorpay Order",
  //   });
  // }
};

// verify Signature of Razorpay and server
exports.verifySignature = async (req, res) => {
  // signature from server
  const webHookSecret = "123456789";

  // fetch razorpay signature
  const signature = req.headers["x-razorpay-signature"];

  // Hmac: hash based message authentication code || Hmac is a combination of two things: 1. hashing algorithm and 2. secret key
  // sha: secure hashing algorithm
  const shaSum = crypto.createHmac(sha256, webHookSecret); // Hmac object

  shaSum.update(JSON.stringify(req.body)); // update shaSum into req.body by converting it to string format

  // now webHookSecret is converted into digest format
  const digest = shaSum.digest("hex");

  if (signature === digest) {
    console.log("payment is Authorized");

    // fetch user details from razorpay
    const { courseId, userId } = req.body.payload.payment.entity.notes;
    try {
      // fulfill the action

      // find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      // verify the response
      if (!enrolledCourse) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      // find the student and add course to their list of enrolled courses
      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { course: courseId } },
        { new: true }
      );
      // send confirmation email
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations from H&M",
        "Congratulations, you are onboarded into new Tech Buddy Course!"
      );
      console.log(emailResponse);
      return res.status(200).json({
        success: true,
        message: "Signature Verified and Course added to Student Profile",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error enrolling student",
      });
    }
  } else {
    // signature not matched
    return res.status(400).json({
      success: false,
      message: "Invalid Signature",
    });
  }
};

// TODO(HW): read about checksum
