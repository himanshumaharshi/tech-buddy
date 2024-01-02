import React from "react";
import CTAButton from "./Button";
import { FaArrowRight } from "react-icons/fa";
import instructorImage from "../../../assets/Images/Instructor.png";
import HigilightText from "./HigilightText";

const InstructorSection = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-20 items-center">
      <div className="flex flex-row gap-20 items-center">
        {/* left */}
        <div className="lg:w-[50%]">
          <img
            src={instructorImage}
            alt="instructorImage"
            className="shadow-white shadow-[-20px_-20px_0_0]"
          />
        </div>

        {/* right */}
        <div className="lg:w-[50%] flex flex-col gap-10">
          <div className="lg:w-[50%] text-4xl font-semibold">
            Become an
            <HigilightText text={"Instructor"} />
          </div>

          <p className="font-medium text-[16px] text-justify w-[90%] text-richblack-300">
            Instructors from around the world tech millions of students on
            StudyNotion. We provide tools and skills to tech what you love.
          </p>

          <div className="w-fit">
            <CTAButton active={true} linkto={"/signup"}>
              <div className="flex gap-3 items-center">
                Start Learning Today
                <FaArrowRight />
              </div>
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorSection;
