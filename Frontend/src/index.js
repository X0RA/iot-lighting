import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./pages/root";
import Home from "./pages/home";
import About from "./pages/about";
import NotFound from "./pages/NotFound";

import Login from "./pages/Login.js";
import Logout from "./pages/logout.js";
import Signup from "./pages/signup.js";

import Lights from "./pages/Lights.js";
import AddLight from "./pages/AddLight.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "About",
        element: <About />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      {
        path: "lights",
        element: <Lights />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "addlight",
        element: <AddLight />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);
