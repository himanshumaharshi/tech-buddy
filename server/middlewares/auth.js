const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = async (req, res, next) => {
  try {
    // extract token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization").replace("Bearer ", "");

    //   if token is missing, then return response
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is Missing",
      });
    }

    // verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
    } catch (error) {
      // verification failed
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};

// isStudent
exports.isStudent = async (req, res, next) => {
  try {
    // fetch data from database
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "Wrong Account Type, this is a protected route for Student",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Invalid Account Type: Not Student",
    });
  }
};

// isInstructor
exports.isInstructor = async (req, res, next) => {
  try {
    // fetch data from database
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "Wrong Account Type, this is a protected route for Instructor",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Invalid Account Type: Not Instructor",
    });
  }
};

// isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    // fetch data from database
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "Wrong Account Type, this is a protected route for Admin",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Invalid Account Type: Not Admin",
    });
  }
};
