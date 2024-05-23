import { useEffect, useState } from "react";
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs";
import { useSelector } from "react-redux";
import { Link, matchPath, useLocation } from "react-router-dom";
import { MdOutlineCancel } from "react-icons/md";

import logo from "../../assets/Logo/Logo-Full-Light.png";
import { NavbarLinks } from "../../data/navbar-links";
import { apiConnector } from "../../services/apiconnector";
import { categories } from "../../services/apis";
import { ACCOUNT_TYPE } from "../../utils/constants";
import ProfileDropdown from "../core/Auth/ProfileDropDown";

const Navbar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API);
        setSubLinks(res.data.data);
      } catch (error) {
        console.log("Could not fetch Categories.", error);
      }
      setLoading(false);
    })();
  }, []);

  const toggleDropDown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <div
      className={`flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700 ${
        location.pathname !== "/" ? "bg-richblack-800" : ""
      } transition-all duration-200 relative`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        {/* logo */}
        <Link to="/">
          <img
            src={logo}
            width={160}
            height={32}
            loading="lazy"
            alt="logoImage"
          />
        </Link>
        {/* Navigation bar Links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <>
                    <div
                      className={`group relative flex cursor-pointer items-center gap-1 ${
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      <p>{link.title}</p>
                      <BsChevronDown />
                      <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                        <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                        {loading ? (
                          <p className="text-center">Loading...</p>
                        ) : subLinks.length ? (
                          <>
                            {subLinks
                              ?.filter(
                                (subLink) => subLink?.courses?.length > 0
                              )
                              ?.map((subLink, i) => (
                                <Link
                                  to={`/catalog/${subLink.name
                                    .split(" ")
                                    .join("-")
                                    .toLowerCase()}`}
                                  className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                  key={i}
                                >
                                  <p>{subLink.name}</p>
                                </Link>
                              ))}
                          </>
                        ) : (
                          <p className="text-center">No Courses Found</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link to={link?.path}>
                    <p
                      className={`${
                        matchRoute(link?.path)
                          ? "text-yellow-25"
                          : "text-richblack-25"
                      }`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          {/* Login/SignUp/Dashboard buttons */}
          <div className="items-center gap-x-4 flex">
            {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
              <Link to="/dashboard/cart" className="relative">
                <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
                {totalItems > 0 && (
                  <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            {token === null && (
              <Link to="/login">
                <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                  Log in
                </button>
              </Link>
            )}
            {token === null && (
              <Link to="/signup">
                <button className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100">
                  Sign up
                </button>
              </Link>
            )}
            {token !== null && <ProfileDropdown />}
          </div>

          <div className="mr-4 flex md:hidden" onClick={toggleDropDown}>
            {isDropdownOpen ? (
              <MdOutlineCancel fontSize={24} fill="#AFB2BF" />
            ) : (
              <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
            )}
          </div>
          <div className="flex md:hidden absolute top-[3rem] right-8 bg-richblack-700 rounded-xl z-10 opacity-100">
            {isDropdownOpen && (
              <div className="w-[12rem] bg-zinc-800 rounded-xl text-lg font-bold text-zinc-600 transition-all duration-200 p-2 flex flex-col justify-center items-center">
                <nav>
                  <ul className="flex gap-y-4 flex-col p-2 text-richblack-25">
                    {NavbarLinks.map((link, index) => (
                      <li key={index}>
                        {link.title === "Catalog" ? (
                          <>
                            <div
                              className={`group relative flex cursor-pointer items-center gap-1 ${
                                matchRoute("/catalog/:catalogName")
                                  ? "text-yellow-25"
                                  : "text-richblack-25"
                              }`}
                            >
                              <p>{link.title}</p>
                              <BsChevronDown />
                              <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-2 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 ">
                                {loading ? (
                                  <p className="text-center">Loading...</p>
                                ) : subLinks.length ? (
                                  <>
                                    {subLinks
                                      ?.filter(
                                        (subLink) =>
                                          subLink?.courses?.length > 0
                                      )
                                      ?.map((subLink, i) => (
                                        <Link
                                          to={`/catalog/${subLink.name
                                            .split(" ")
                                            .join("-")
                                            .toLowerCase()}`}
                                          className="rounded-lg bg-transparent py-2 pl-4 hover:bg-richblack-50 text-sm"
                                          key={i}
                                        >
                                          <p>{subLink.name}</p>
                                        </Link>
                                      ))}
                                  </>
                                ) : (
                                  <p className="text-center">
                                    No Courses Found
                                  </p>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <Link to={link?.path}>
                            <p
                              className={`${
                                matchRoute(link?.path)
                                  ? "text-yellow-25"
                                  : "text-richblack-25"
                              }`}
                            >
                              {link.title}
                            </p>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
