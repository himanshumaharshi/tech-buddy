import React from "react";
import CourseCard from "./CourseCard";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { FreeMode, Pagination } from "swiper/modules";

export default function CourseSlider({ Courses }) {
  return (
    <>
      {Courses?.length ? (
        <div>
          <Swiper
            slidesPerView={1}
            spaceBetween={25}
            loop={true}
            modules={[FreeMode, Pagination]}
            breakpoints={{
              1024: {
                slidesPerView: 3,
              },
            }}
            className="max-h-[30rem]"
          >
            {Courses?.map((course, i) => (
              <SwiperSlide key={i}>
                <CourseCard course={course} Height={"h-[250px]"} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <p className="text-xl text-richblack-5">No Course Found</p>
      )}
    </>
  );
}
