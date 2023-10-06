import { Outlet, Link } from "react-router-dom";
import Navigation from "../components/Header";

export default function Root() {
  return (
    <>
      <Navigation />
      <div className="text-center">
        <Outlet />
      </div>
    </>
  );
}
