import React, { useEffect, useState } from "react";
import { createUserDocument, createLight, getLights, updateLight, deleteLight } from "../components/firebase.js";
import { GithubPicker } from "react-color";

const Lights = () => {
  // State
  const [lights, setLights] = useState([]);
  const [brightnessUI, setBrightnessUI] = useState({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingLight, setEditingLight] = useState(null);
  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0, left: 0 });
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  // Effects
  const handleFieldUpdate = async () => {
    if (editingField) {
      try {
        await updateLight(editingField.light.id, { [editingField.type]: editingValue });
        setLights((prev) =>
          prev.map((l) => (l.id === editingField.light.id ? { ...l, [editingField.type]: editingValue } : l))
        );
        setEditingField(null); // Reset the editing state
      } catch (error) {
        console.error(`Error updating ${editingField.type}:`, error);
      }
    }
  };

  useEffect(() => {
    const fetchLights = async () => {
      try {
        const fetchedLights = await getLights();
        setLights(fetchedLights);
      } catch (error) {
        console.error("Error fetching lights:", error);
      }
    };

    fetchLights();
  }, []);

  // Handlers
  const handleSliderChange = (lightId, updatedBrightness) => {
    setBrightnessUI((prev) => ({ ...prev, [lightId]: updatedBrightness }));
  };

  const handleBrightnessChange = async (lightId) => {
    if (brightnessUI[lightId] !== undefined) {
      try {
        await updateLight(lightId, { "status.brightness": brightnessUI[lightId] });
        setLights((prev) =>
          prev.map((l) => (l.id === lightId ? { ...l, status: { ...l.status, brightness: brightnessUI[lightId] } } : l))
        );
      } catch (error) {
        console.error("Error updating brightness:", error);
      }
    }
  };

  const handleColorClick = (light, { clientY, clientX }) => {
    setEditingLight(light);
    setColorPickerPosition({ top: clientY, left: clientX });
    setShowColorPicker(true);
  };

  const toggleLightStatus = async (light) => {
    try {
      const updatedStatus = !light.status.isOn;
      await updateLight(light.id, { "status.isOn": updatedStatus });
      setLights((prevLights) =>
        prevLights.map((l) => (l.id === light.id ? { ...l, status: { ...l.status, isOn: updatedStatus } } : l))
      );
    } catch (error) {
      console.error("Error updating light status:", error);
    }
  };

  const handleColorChangeComplete = async (color) => {
    if (!editingLight) return;

    try {
      const updatedColor = color.hex;
      await updateLight(editingLight.id, { "status.color": updatedColor });
      setLights((prev) =>
        prev.map((l) => (l.id === editingLight.id ? { ...l, status: { ...l.status, color: updatedColor } } : l))
      );
      setShowColorPicker(false);
    } catch (error) {
      console.error("Error updating color:", error);
    }
  };

  // Render
  return (
    <div>
      <h1>Lights</h1>
      {showColorPicker && (
        <div
          style={{ position: "fixed", top: colorPickerPosition.top + 20, left: colorPickerPosition.left, zIndex: 2 }}>
          <GithubPicker color={editingLight?.status.color} onChangeComplete={handleColorChangeComplete} />
        </div>
      )}

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-3 border-b border-gray-200 bg-gray-50">ID</th>
            <th className="py-2 px-3 border-b border-gray-200 bg-gray-50">Name</th>
            <th className="py-2 px-3 border-b border-gray-200 bg-gray-50">Status</th>
            <th className="py-2 px-3 border-b border-gray-200 bg-gray-50">Colour</th>
            <th className="py-2 px-3 border-b border-gray-200 bg-gray-50">Brightness</th>
            <th className="py-2 px-3 border-b border-gray-200 bg-gray-50">Location</th>
            <th className="py-2 px-3 border-b border-gray-200 bg-gray-50">Type</th>
            <th className="py-2 px-3 border-b border-gray-200 bg-gray-50">Delete</th>
          </tr>
        </thead>
        <tbody>
          {lights.map((light) => (
            <tr key={light.id}>
              <td className="py-2 px-3 border-b border-gray-200">{light.id}</td>
              <td className="py-2 px-3 border-b border-gray-200">
                {editingField?.light.id === light.id && editingField.type === "name" ? (
                  <input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={handleFieldUpdate}
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => {
                      setEditingField({ light, type: "name" });
                      setEditingValue(light.name);
                    }}>
                    {light.name}
                  </span>
                )}
              </td>

              <td className="py-2 px-3 border-b border-gray-200">
                <button
                  className={`py-2 px-4 border-b  rounded-lg border-gray-200 cursor-pointer ${
                    light.status.isOn ? "bg-primary-500" : "bg-secondary-500"
                  }`}
                  onClick={() => toggleLightStatus(light)}>
                  {light.status.isOn ? "On" : "Off"}
                </button>
              </td>

              <td className="py-2 px-3 border-b border-gray-200">
                <div
                  onClick={(event) => handleColorClick(light, event)}
                  style={{
                    cursor: "pointer",
                    width: "20px",
                    height: "20px",
                    backgroundColor: light.status.color,
                    border: "1px solid #000",
                    borderRadius: "50%",
                  }}></div>
              </td>
              <td className="py-2 px-3 border-b border-gray-200">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightnessUI[light.id] ?? light.status.brightness}
                  onChange={(e) => handleSliderChange(light.id, parseInt(e.target.value, 10))}
                  onMouseUp={() => handleBrightnessChange(light.id)}
                  className="slider"
                />
              </td>
              <td className="py-2 px-3 border-b border-gray-200">
                {editingField?.light.id === light.id && editingField.type === "location.room" ? (
                  <input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={handleFieldUpdate}
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => {
                      setEditingField({ light, type: "location.room" });
                      setEditingValue(light.location.room);
                    }}>
                    {light.location.room}
                  </span>
                )}
              </td>
              <td className="py-2 px-3 border-b border-gray-200">{light.type}</td>
              <td className="py-2 px-3 border-b border-gray-200">
                <button
                  className=" text-white hover:bg-secondary-700 py-2 px-4  rounded-lg bg-secondary-500"
                  onClick={async () => {
                    const success = await deleteLight(light.id);
                    if (success) {
                      setLights((prevLights) => prevLights.filter((l) => l.id !== light.id));
                    }
                  }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Lights;
