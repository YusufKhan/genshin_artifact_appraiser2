"use client";
import React, { useState, useEffect } from "react";
import { calculateRVs } from "@/utils/calcRVs";
import { handleChange } from "@/utils/handleChange";
import { fetchEnkaData } from "@/utils/fetchEnkaData";
import { WeightsData, UserData, CharacterRollValues } from "@/utils/interfaces";

const weightsFile = "/startingWeights.json";

const HomePage = () => {
  // =========================
  // State and Variables
  // =========================

  const [loading, setLoading] = useState(false); // Loading circle
  const [uid, setUid] = useState(""); // UID ultimately fed to fetchEnkaData
  const [userData, setUserData] = useState<UserData>(); // Received from lib/enkaFetch
  const [weights, setWeights] = useState<WeightsData>({}); // For resetting weights with button
  const [rollValues, setRollValues] = useState<CharacterRollValues[]>([]); // The final character RV table
  const [error, setError] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false); // What is this button
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Try and get data from browser local storage
    setUid(localStorage.getItem("uid") || "");
    setWeights(JSON.parse(localStorage.getItem("weights") || "{}"));
    setRollValues(JSON.parse(localStorage.getItem("rollValues") || "[]"));
    setUserData(JSON.parse(localStorage.getItem("userData") || "[]"));

    const loadWeights = async () => {
      // Set to starting weights from JSON file, if nothing stored locally
      const savedWeights = localStorage.getItem("weights") || "";
      if (savedWeights) {
        setWeights(JSON.parse(savedWeights));
      } else {
        handleResetWeights();
      }
    };
    loadWeights();
  }, []);

  // =========================
  // Event Handlers
  // =========================

  const handleSubmit = async (newUID: string, newWeights: WeightsData) => {
    console.time("handleSubmit");
    localStorage.setItem("uid", uid);
    setUid(uid);
    setError("");
    setLoading(true);
    try {
      const newUserData = (await fetchEnkaData(newUID)) as UserData;
      localStorage.setItem("userData", JSON.stringify(newUserData));
      setLoading(false);
      setUserData(newUserData);
      console.timeEnd("handleSubmit");
      handleCalc(newUserData, newWeights);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message); // Use the error message
      } else {
        setError("An unknown error occurred");
      }
      console.error("Fetch error:", error);
    }
  };

  const handleCalc = async (
    newCharacterData: UserData,
    newWeights: WeightsData
  ) => {
    if (newCharacterData.avatarInfoList) {
      const newTeamData = calculateRVs(newCharacterData, newWeights);
      const newRollValues = newTeamData.allCharacterRVs;
      const updatedWeights = newTeamData.weights;

      localStorage.setItem("rollValues", JSON.stringify(newRollValues));
      setRollValues(newRollValues);
      localStorage.setItem("weights", JSON.stringify(updatedWeights));
      setWeights(updatedWeights);
      setButtonDisabled(false);
      return newRollValues;
    }
  };

  const toggleExpand = () => {
    // For the extra info box
    setIsExpanded(!isExpanded);
  };

  const handleResetWeights = async () => {
    try {
      const response = await fetch(weightsFile);
      if (!response.ok) {
        throw new Error("Failed to load weights file");
      }
      const data: WeightsData = await response.json();
      setWeights(data);
      localStorage.setItem("weights", JSON.stringify(data));
    } catch (error) {
      console.error("Error loading weights:", error);
    }
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    setRollValues([]);
    setUserData(null as unknown as UserData);
    //setMessage('Local storage cleared');
    setButtonDisabled(true);
  };

  // =========================
  // Render
  // =========================

  return (
    <div className="container mx-auto p-4">
      <section className="hero flex items-center justify-center text-center bg-transparent py-4">
        <div className="github-corner">
          <a
            href="https://github.com/YusufKhan/genshin_artifact_appraiser2"
            target="GAA"
            aria-label="View source on GitHub"
          >
            <div className="github-icon"></div>
          </a>
        </div>

        <div className="hero-content">
          <h1 className="text-4xl font-bold text-gray-200 drop-shadow-lg">
            Genshin Impact Artifact Analyzer
          </h1>

          <div className="flex justify-center items-center mt-6">
            <input // UID entry field
              type="number"
              placeholder="Enter UID"
              value={uid}
              onChange={(event) => setUid(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  // Enter or click to submit
                  handleSubmit(uid, weights);
                }
              }} // Input text box design
              className="text-gray-100 text-lg text-center border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-2 max-w-sm"
            />

            <button
              onClick={() => handleSubmit(uid, weights)}
              className="ml-4 px-4 py-2 bg-blue-500 text-gray-100 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 text-lg font-semibold"
            >
              Submit
            </button>
          </div>

          {loading && (
            <div className="loading-screen">
              <div className="spinner"></div>
              <p className="loading-text">Loading...</p>
            </div>
          )}

          {error && (
            <div className="error-message text-red-500 mt-2">
              <p>{error}</p>
            </div>
          )}
        </div>
      </section>

      <section className="character-section py-2">
        <h2 className="mt-2 mb-4 text-4xl font-bold text-gray-200 text-center">
          Artifact Roll Value (% of Max)
        </h2>
        <div className="overflow-x-auto mx-auto">
          <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-lg">
            {rollValues && (
              <table className="table-auto w-full">
                <thead className="bg-gray-600">
                  <tr className="text-gray-100 uppercase">
                    <th className="py-3 px-6 text-center font-semibold border-r border-gray-100">
                      Character
                    </th>
                    <th className="py-3 px-6 text-center border-r border-gray-100">
                      Flower
                    </th>
                    <th className="py-3 px-6 text-center border-r border-gray-100">
                      Feather
                    </th>
                    <th className="py-3 px-6 text-center border-r border-gray-100">
                      Sands
                    </th>
                    <th className="py-3 px-6 text-center border-r border-gray-100">
                      Goblet
                    </th>
                    <th className="py-3 px-6 text-center border-r border-gray-100">
                      Circlet
                    </th>
                    <th className="py-3 px-6 text-center border-l-2 border-blue-950">
                      Average
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rollValues.length > 0 &&
                    rollValues.map((character, index) => (
                      <tr key={index} className=" bg-white ">
                        <td className="py-3 px-6 text-right text-black font-semibold whitespace-nowrap bg-gray-400 border-r border-t border-gray-100">
                          {character.name}
                        </td>
                        {character.rollValues.map((rv, artifactSlot) => {
                          // Remove name from array then make row of colored RVs
                          const red = 255 - (Number(rv) / 100) * 255; // Lower number is more red
                          const green = (Number(rv) / 100) * 255;
                          const alpha = Math.exp((-2.71828 * Number(rv)) / 100); // Euler number log scaling. Alpha up with lower number
                          const bgColor = `rgba(${red},${green},0,${alpha})`;
                          const borderStyle =
                            artifactSlot === character.rollValues.length - 1
                              ? "2px solid #172554"
                              : "none";

                          const calcBreakdown =
                            character.calcBreakdown[artifactSlot] || ""; // Your array of descriptions
                          return (
                            // RV value and color
                            <td
                              key={artifactSlot}
                              className="artifact-cell font-semibold"
                              style={{
                                backgroundColor: bgColor,
                                borderLeft: borderStyle,
                                borderRight: borderStyle,
                              }}
                              title={calcBreakdown} // Hover label for 5 artifacts
                            >
                              {rv}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      <div className="bg-gray-600 mx-auto p-4 mt-6 max-w-2xl rounded-lg">
        <div
          onClick={toggleExpand}
          className="flex justify-center items-center cursor-pointer"
        >
          <p className="font-semibold text-gray-100 text-center">
            How it works:
          </p>
          <span
            className={`ml-2 transform transition-transform ${
              isExpanded ? "rotate-180" : "rotate-0"
            }`}
            style={{ color: "white" }}
          >
            ▼
          </span>
        </div>
        {isExpanded && (
          <ul className="list-disc p-6 space-y-2 text-gray-100">
            <li>
              This app calculates the % of how close your artifacts are compared
              to ones with perfect substats, max rolls and the same mainstat.
              The final Roll Value and Average Gear Score is given as a
              percentage of this max. Hover over the final value to see a
              breakdown of the calculation.
            </li>
            <li>
              The roll values are weighted by the importance of each substat.
              The substat weights equal the % total DMG increase a max roll
              provides.
            </li>
            <li>
              Weights for each character can be edited below to match your setup
              and rotation. If using a calculator like
              https://genshin.aspirine.su/ , you can multiply the Substat
              Bonuses values by 0.85 to find the max roll improvement. Your
              edited weights table will be saved in your browser.
            </li>
          </ul>
        )}
      </div>
      <h2 className="mt-8 mb-4 text-4xl font-bold text-gray-200 text-center">
        Editable Weights
      </h2>
      <div className="overflow-auto">
        {weights && (
          <table className="rounded-lg custom-table">
            <thead>
              <tr className="bg-gray-600 text-gray-100 uppercase leading-normal">
                <th className="py-3 text-center">Character</th>
                <th className="text-center">HP</th>
                <th className="text-center">DEF</th>
                <th className="text-center">ATK</th>
                <th className="text-center">HP%</th>
                <th className="text-center">ATK%</th>
                <th className="text-center">DEF%</th>
                <th className="text-center">CR</th>
                <th className="text-center">CDMG</th>
                <th className="text-center">ER</th>
                <th className="text-center">EM</th>
                <th className="text-center">ER needed</th>
              </tr>
            </thead>

            <tbody>
              {rollValues.length > 0 &&
                rollValues.map((avatar, index) => {
                  const avatarId = avatar.id;
                  const characterData = weights[avatarId];

                  return (
                    <tr key={index}>
                      <td className="text-right text-gray-100 font-semibold bg-gray-600">
                        {characterData.name}
                      </td>
                      {characterData.weights.map((value, index) => (
                        <td key={index}>
                          <input
                            type="number"
                            value={value}
                            onChange={(event) =>
                              handleChange(avatarId, index, event, setWeights)
                            }
                            onWheel={(event) => event.currentTarget.blur()}
                            aria-label="Character damage % improvement for substat: "
                            className=" text-gray-100 text-center custom-input"
                            step="any"
                          />
                        </td>
                      ))}
                      <td className="text-center text-gray-100">
                        <input
                          type="number"
                          value={characterData.energyNeeded}
                          onChange={(event) =>
                            handleChange(avatarId, index, event, setWeights)
                          }
                          onWheel={(event) => event.currentTarget.blur()}
                          aria-label="Character damage % improvement for substat: "
                          className=" text-gray-100 text-center custom-input"
                          step="any"
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={() => {
            if (userData) {
              handleCalc(userData, weights);
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              console.error("userData is undefined");
            }
          }}
          className="px-4 py-2 m-2 bg-blue-500 text-gray-100 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 text-lg font-semibold"
        >
          Recalculate RVs
        </button>
      </div>

      <div className="flex justify-center mt-4 mb-4">
        <button
          onClick={() => {
            handleResetWeights();
          }}
          className="px-4 py-2 mr-4 bg-red-500 text-gray-100 rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-200 text-lg font-semibold"
        >
          Reset weights
        </button>

        <button
          onClick={clearLocalStorage}
          className={`ml-4 px-4 py-2 ${
            buttonDisabled ? "bg-gray-400" : "bg-red-500"
          } text-gray-100 rounded-lg ${
            buttonDisabled ? "" : "hover:bg-red-600"
          } focus:ring-2 focus:ring-red-200 text-lg font-semibold`}
          disabled={buttonDisabled}
        >
          {buttonDisabled ? "Cleared" : "Clear Characters"}
        </button>
      </div>
    </div>
  );
};

export default HomePage;
