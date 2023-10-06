import React, { useEffect } from "react";
import { logout } from "../components/firebase";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();
  useEffect(() => {
    const doLogout = async () => {
      const result = await logout();

      if (result) {
        console.log("Logged out successfully");
        navigate("/");
      } else {
        console.log("Failed to log out");
      }
    };

    doLogout();
  }, []);

  return <div>Logging out...</div>;
}

export default Logout;
