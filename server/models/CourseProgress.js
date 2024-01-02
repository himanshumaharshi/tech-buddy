const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
  courseID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
  },
  completedVideos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection", // videoProgress
    },
  ],
});

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
