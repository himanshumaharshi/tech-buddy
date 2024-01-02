const Category = require("../models/Category");

function getRandomInt(max) {
  return Math.floor(Math.random()*max)
}

// createCategorys
exports.createCategory = async (req, res) => {
  try {
    // fetch data
    const { name, description } = req.body;

    // validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Invalid name or description",
      });
    }
    
    // create new entry in database
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(categoryDetails);

    //   return success response
    return res.status(200).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, cannot create Category",
    });
  }
};

// showAllCategories
exports.showAllCategories = async (req, res) => {
  try {
    // fetch Category
    const allCategory = await Category.find(
      {},
      { name: true, description: true }
    );

    // return success response
    return res.status(200).json({
      success: true,
      message: "All Categorys fetched successfully",
      allCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, cannot create Category",
    });
  }
};

// category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    // get categoryId
    const { categoryId } = req.body;

    // Get courses for the specified category
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();
    console.log(selectedCategory);

    // Handle the case when the category is not found
    if (!selectedCategory) {
      console.log("Category not found.");
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected category.");
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      });
    }

    const selectedCourses = selectedCategory.courses;

    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate("courses")
      .exec();
    let differentCourses = [];
    for (const category of categoriesExceptSelected) {
      differentCourses.push(...category.courses);
    }

    // Get top-selling courses across all categories
    const allCategories = await Category.find().populate("courses");
    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      message: 'CoursePageDetails',
      data: {
        selectedCourses: selectedCourses,
        differentCourses: differentCourses,
        mostSellingCourses: mostSellingCourses,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error Getting category page details",
    });
  }
};
