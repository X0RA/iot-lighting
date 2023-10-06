import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const NotFound = () => {
    const [imageUrl, setImageUrl] = useState("");

    // Fetch a random cat image from an external API
    useEffect(() => {
        axios
            .get("https://api.thecatapi.com/v1/images/search")
            .then((response) => {
                setImageUrl(response.data[0].url);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops! Page not found.</h1>
            <p className="text-gray-500 text-lg mb-8">The page you are looking for does not exist.</p>
            <img src={imageUrl} alt="Random cat" className="rounded-full w-64 h-64 mb-8" />
            <Link to="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Go back to the home page
            </Link>
        </div>
    );
};

export default NotFound;
