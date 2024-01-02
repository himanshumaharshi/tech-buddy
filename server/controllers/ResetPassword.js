const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
  try {
    // fetch email address form req.body
    const email = req.body.email;

    // email validation, check user for this email exists or not
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
      });
    }

    // generate token
    // npm crypto in discontinued as it is integrated in node-moadules itself
    const token = crypto.randomBytes(20).toString("hex");

    // update user by adding toke and expiration time
    const updatedDatails = await User.findOneAndUpdate(
      { email: email },
      { token: token, resetPasswordExpires: Date.now() + 3600000 },
      { new: true }
    );
    console.log("DETAILS: ", updatedDatails);

    // create url link for frontend to reset password
    const url = `http://localhost:3000/update-password/${token}`;

    // send email containing the url
    await mailSender(
      email,
      "Password Reset Link",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`
    );

    // return response
    return res.status(200).json({
      success: true,
      message: "Password Reset Link sent Successfully, Please Check Email",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, cannot send reset password link",
    });
  }
};

// resetPassword
exports.resetPassword = async (req, res) => {
  try {
    // fetch data from req.body
    const { password, confirmPassword, token } = req.body;

    // validate data
    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Password not matches",
      });
    }
    // get userDetails from database using token
    const userDetails = await User.findOne({ token: token });

    // if no entry fonund for token means invalid token
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "Token is invalid",
      });
    }

    // token time expired
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Token expired, please regenetate the token",
      });
    }

    // hash password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // update password
    await User.findOneAndUpdate(
      { token: token },
      { password: encryptedPassword },
      { new: true }
    );

    // return success response
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, cannot reset password",
    });
  }
};
