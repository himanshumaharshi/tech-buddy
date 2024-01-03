import React from "react";
import HigilightText from "../HomePage/HigilightText";

const Quote = () => {
  return (
    <div className=" text-xl md:text-4xl font-semibold mx-auto py-5 pb-20 text-center text-white">
      we are passionate about revolutionizing the way we learn. Our innovative
      platform <HigilightText text={"combines technology"} />
      <span className="bg-gradient-to-b from-[#FF512F] to-[#F09819] text-transparent bg-clip-text font-bold">
        {" "}
        expertise
      </span>
      , and community to create an
      <span className="bg-gradient-to-b from-[#FF512F] to-[#F09819] text-transparent bg-clip-text font-bold">
        {" "}
        unparalled educational experience.
      </span>
    </div>
  );
};

export default Quote;
