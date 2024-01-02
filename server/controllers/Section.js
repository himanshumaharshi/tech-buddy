const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    // fetch data
    const { sectionName, courseId } = req.body;

    // data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }

    // create section
    const newSection = await Section.create({ sectionName });

    // update course with section ObjectId
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    ).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    })
    .exec();
    // TODO(HW): use populate to replace sections/ sub-sectons voth in  the updatedCourse

    // return success response
    return res.status(200).json({
      success: true,
      message: "Section Creted Successfully",
      updatedCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Unable to create section",
    });
  }
};

// updatesection handler
exports.updateSection = async (req, res) => {
  try {
    // data input
    const { sectionName, sectionId } = req.body;

    // data validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }

    // update data
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    //return success response
    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Unable to create section",
    });
  }
};

// deleteSection function handler
exports.deleteSection = async (req, res) => {
  try {
    // fetch sectionId
    const { sectionId } = req.body;

    // use findByIdAndDelete
    await Section.findByIdAndDelete(sectionId);

    // TODO[testing]: do we need to delete the entry from the course schema?

    //return success response
    return res.status(200).json({
      success: true,
      message: "Section Deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete section",
    });
  }
};
