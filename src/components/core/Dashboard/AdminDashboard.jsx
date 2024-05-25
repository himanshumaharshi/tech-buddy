import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourseCategories } from "../../../services/operations/courseDetailsAPI";
import IconBtn from "../../common/IconBtn";
import { useForm } from "react-hook-form";
import { createCategory } from "../../../services/operations/courseDetailsAPI";
import { Toaster } from "react-hot-toast";

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth);
  const [courseCategories, setCourseCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitProfileForm = async (data) => {
    try {
      setLoading(true);
      await createCategory(
        { name: data.name, description: data.description },
        token
      );
      setLoading(false);
    } catch (error) {
      console.log("ERROR CREATING CATEGORY - ", error.message);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const categories = await fetchCourseCategories();
      if (categories.length > 0) {
        setCourseCategories(categories);
      }
      // console.log("Categories: ", categories);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r-[1px] border-r-richblack-700 bg-richblack-800">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="text-white flex justify-center items-center flex-col">
      <form onSubmit={handleSubmit(submitProfileForm)}>
        <div className="my-10 flex w-[35rem] flex-col gap-y-6 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-12">
          <h2 className="text-lg font-semibold text-richblack-5">
            Category Details
          </h2>
          <div className="flex flex-col w-full gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="lable-style">
                Category Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter first name"
                className="form-style"
                {...register("name", { required: true })}
              />
              {errors.firstName && (
                <span className="-mt-1 text-[12px] text-yellow-100">
                  Please enter category name.
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="lable-style">
                Category Description
              </label>
              <input
                type="text"
                name="description"
                id="description"
                placeholder="Enter category description"
                className="form-style"
                {...register("description", { required: true })}
              />
              {errors.firstName && (
                <span className="-mt-1 text-[12px] text-yellow-100">
                  Please enter category description.
                </span>
              )}
            </div>
          </div>
          <IconBtn
            type="submit"
            text="Create new Category"
            className="mx-auto"
          />
        </div>
      </form>
      <div className="space-y-2">
        {/* render all categories */}
        <div className="w-[35rem] flex flex-col p-8 bg-richblack-700 rounded-3xl gap-4">
          {courseCategories.map((category, index) => (
            <div key={index} className="flex gap-1 flex-col">
              <h3 className="text-lg font-semibold">
                Category Name: {category.name}
              </h3>
              <h3 className="flex text-[#4aff2a]">
                Category Description: {category.description}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
