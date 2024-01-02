const express = require("express");
const app = express();

// take instances of routes
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

// connect to database
database.connect();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http:localhost:3000",
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// connect to cloudinary
cloudinaryConnect();

// mount routes / create api routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/course", courseRoutes);

// default route
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is Up",
  });
});

// activate server on port
app.listen(PORT, () => {
  console.log(`Server Listening on Port: ${PORT}`);
});

/*
-------------------- Installed Packages --------------------
npm init -y
npm i bcrypt
npm i bcryptjs
npm i cloudinary
npm i cookie-parser
npm i cors
npm i crypto-random-string
npm i dotenv
npm i express
npm i express-fileupload
npm i jsonwebtoken
npm i mongoose
npm i node-scheduler
npm i nodemailer
npm i nodemon
npm i otp-generator
npm i razorpay

*/
