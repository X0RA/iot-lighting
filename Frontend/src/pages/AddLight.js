import React, { useState, useEffect } from "react";
import { generateNewAPIKey, getAPIKey, createLight } from "../components/firebase";

function AddLight() {
  const [apiKey, setApiKey] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    type: "",
  });
  const [message, setMessage] = useState("");

  const handleRefreshKey = () => {
    setShowConfirmation(true);
  };

  const confirmRefreshKey = async () => {
    try {
      const newApiKey = await generateNewAPIKey();
      setApiKey(newApiKey);
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error refreshing API key:", error);
    }
  };

  const cancelRefreshKey = () => {
    setShowConfirmation(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Create a new light using the Firebase API
      const newLightId = await createLight({
        name: formData.name,
        location: {
          room: formData.location,
        },
        type: formData.type,
        status: {
          isOn: false,
          brightness: 0,
          color: "#004dcf",
        },
      });

      // Display a success message and clear the form
      setMessage(`Light with ID ${newLightId} created successfully.`);
      setFormData({
        name: "",
        location: "",
        type: "",
      });
    } catch (error) {
      // Display an error message if light creation fails
      setMessage(`Error creating light: ${error.message}`);
    }
  };

  useEffect(() => {
    async function fetchAPIKey() {
      const fetchedApiKey = await getAPIKey();
      setApiKey(fetchedApiKey);
    }
    fetchAPIKey();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Add a New Light</h2>
        </div>
        <div className="flex justify-between items-center mb-4 w-full">
          {apiKey !== null ? (
            <span>API Key: {apiKey}</span>
          ) : (
            <span>No API key has been generated, click to generate one</span>
          )}
          {showConfirmation ? (
            <div>
              <button onClick={confirmRefreshKey} className="text-indigo-600 hover:text-indigo-900 mr-4">
                Confirm
              </button>
              <button onClick={cancelRefreshKey} className="text-red-600 hover:text-red-900">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={handleRefreshKey} className="text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z"
                />
              </svg>
            </button>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="location" className="sr-only">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="type" className="sr-only">
                Type
              </label>
              <select
                id="type"
                name="type"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={formData.type}
                onChange={handleInputChange}>
                <option value="" disabled>
                  Select a type
                </option>
                <option value="LED">LED</option>
                <option value="Incandescent">White / Fluorescent</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Add Light
            </button>
          </div>
        </form>

        {message && <p className="text-red-500 mt-2">{message}</p>}
      </div>
    </div>
  );
}

export default AddLight;
