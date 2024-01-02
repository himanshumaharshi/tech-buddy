import React from "react";
import HigilightText from "./HigilightText";
import knowYourProgressImage from "../../../assets/Images/Know_your_progress.png";
import compareWithOthersImage from "../../../assets/Images/Compare_with_others.png";
import planYourLessonsImage from "../../../assets/Images/Plan_your_lessons.png";
import CTAButton from "./Button";

const LearningLanguageSection = () => {
  return (
    <div>
      <div className="text-4xl font-semibold text-center my-10 mt-32">
        {/* heading 1 */}
        Your Swiss Knief for
        <HigilightText text={"learning any language"} />
        {/* descreption */}
        <div className="text-center text-richblack-700 font-medium lg:w-[75%] mx-auto leading-6 text-base  mt-3">
          Using spin making learning multiple languages easy. With 20+ languages
          realistic voice-over, progress tracking, custom schedule and more.
        </div>
        {/* 3 image cards */}
        <div className="flex flex-col lg:flex-row items-center justify-center mt-8 lg:mt-0">
          <img
            src={knowYourProgressImage}
            alt="knowYourProgressImage"
            className="object-contain lg:-mr-32"
          />
          <img
            src={compareWithOthersImage}
            alt="compareWithOthersImage"
            className="object-contain lg:-mb-10 lg:-mt-0 -mt-12"
          />
          <img
            src={planYourLessonsImage}
            alt="planYourLessonsImage"
            className="object-contain lg:-ml-36 lg:-mt-5 -mt-16"
          />
        </div>
      </div>
      {/* button */}
      <div className="w-fit mx-auto lg:mb-20 mb-8 -mt-5">
        <CTAButton active={true} linkto={"/signup"}>
          Learn More
        </CTAButton>
      </div>
    </div>
  );
};

export default LearningLanguageSection;
