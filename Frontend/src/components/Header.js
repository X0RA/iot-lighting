import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import links from "./links.json";

import { auth, isLoggedIn } from "./firebase.js";

const Navigation = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [filteredLinks, setFilteredLinks] = useState([]);

  const checkLoginStatus = async () => {
    const loggedInStatus = await isLoggedIn();
    setIsUserLoggedIn(loggedInStatus.isLoggedIn);

    if (loggedInStatus.isLoggedIn) {
      setFilteredLinks(links.filter((link) => link.login !== false));
    } else {
      setFilteredLinks(links.filter((link) => link.login !== true));
    }
  };

  useEffect(() => {
    checkLoginStatus();

    const unsubscribe = auth.onAuthStateChanged(() => {
      checkLoginStatus();
    });

    return () => unsubscribe();
  }, []);

  return (
    <nav className="flex items-center justify-between flex-wrap bg-gray-800 px-6 py-4">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <span className="font-semibold text-xl tracking-tight">Luminable</span>
      </div>
      <div className="block lg:hidden">
        <button className="flex items-center px-3 py-2 border rounded text-gray-300 border-gray-400 hover:text-white hover:border-white">
          <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <title>Menu</title>
            <path d="M0 3h20v2H0zM0 9h20v2H0zM0 15h20v2H0z" />
          </svg>
        </button>
      </div>
      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div className="text-sm lg:flex-grow">
          {filteredLinks.map((link, index) => (
            <Link
              key={index}
              to={link.link}
              className="block mt-4 lg:inline-block lg:mt-0 text-gray-300 hover:text-white mr-4">
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
