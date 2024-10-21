'use client';
import React, { useState, useEffect } from 'react';

const HomePage = () => {

  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState(''); // Define the uid state
  const [characterData, setCharacterData] = useState<(string | number)[][]>([]);
  //const [weights, setWeights] = useState();
  const [error, setError] = useState('');
  //const [data, setData] = useState<(string | number)[][]>([]);  

  useEffect(() => {
    // Load cached data from browser localStorage
    const savedUID = localStorage.getItem('uid');
    const savedCharacterData = localStorage.getItem('characterData');
    const savedWeights = localStorage.getItem('weights');

    if (savedUID) {
      setUid(savedUID);
    } else {
      console.error('No saved UID');
    }

    try {
      if (savedCharacterData) {
        setCharacterData(JSON.parse(savedCharacterData));
      } else {
        console.error('No saved characters');
      }

      //Separate from above so they can be cleared independently
      if ((savedWeights !== undefined && savedWeights !== null)) {
        //setWeights(JSON.parse(savedWeights));
      } else {
        console.error('No weights table saved');
      }
    } catch (error) {
      console.log(error);
    }

  }, []);

  /* const handleChange = (character: string, index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle change in weights table
    const newValue = event.target.value;
    setTeams((prevTeams) => {
      const updatedCharacter = [...prevTeams[character]];
      updatedCharacter[index] = parseFloat(newValue);
      return { ...prevTeams, [character]: updatedCharacter };
    }); */

  const handleUIDSubmit = async (uid: string) => {
    setUid(uid)
    setError("")
    setLoading(true);
    console.log("Loading")

    try {
      console.time('FetchData');
      const response = await fetch('api/getCharacterData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });
      console.timeEnd('FetchData');

      const data: (string | number)[][] = await response.json();
      setCharacterData(data);

      localStorage.setItem('uid', uid); // Cache the UID
      localStorage.setItem('characterData', JSON.stringify(data));
      //localStorage.setItem('weights', JSON.stringify(startingWeights));

      //console.log(characterData);

    } catch (error) {
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto p-4">
      <section className="hero flex items-center justify-center text-center bg-transparent py-4">
        <div className="hero-content">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Genshin Impact Artifact Analyzer</h1>

          <div className="flex justify-center items-center mt-6">
            <input
              type="text"
              placeholder="Enter UID"
              value={uid}
              onChange={(event) => setUid(event.target.value)} // Update the uid state
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleUIDSubmit(uid);
                }
              }}
              autoComplete="on"
              className="bg-white text-black text-lg font-semibold text-center border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-2 max-w-sm"
            />
            <button onClick={() => handleUIDSubmit(uid)} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 text-lg font-semibold">
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
            </div>)}
          {/* </div></form> */}
        </div>
      </section>
      {(
        <section className="character-section py-2">
          <h2 className="mt-2 mb-4 text-4xl font-bold text-white text-center">Character Data</h2>
          <div className="overflow-x-auto mx-auto">
            <div className="w-full max-w-[900px] mx-auto rounded-lg overflow-hidden">
              {characterData && (
                <table className="table-auto w-full">
                  <thead className="bg-gray-600">
                    <tr className="text-white uppercase">
                      <th className="py-3 px-6 text-center font-semibold border-r border-gray-300">Character</th>
                      <th className="py-3 px-6 text-center border-r border-gray-300">Flower</th>
                      <th className="py-3 px-6 text-center border-r border-gray-300">Feather</th>
                      <th className="py-3 px-6 text-center border-r border-gray-300">Sands</th>
                      <th className="py-3 px-6 text-center border-r border-gray-300">Goblet</th>
                      <th className="py-3 px-6 text-center border-r border-gray-300">Circlet</th>
                      <th className="py-3 px-6 text-center">Combined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {characterData && (
                      characterData.map((character, index) => (
                        <tr key={index} className="border-t border-gray-300 hover:bg-gray-200 bg-white">
                          <td className="py-3 px-6 text-center text-white font-semibold uppercase whitespace-nowrap bg-gray-600">
                            {character[0]}
                          </td>                          {character.slice(1).map((rv, j) => { // Remove name from array
                            const red = 255 - Number(rv) / 100 * 255;
                            const green = Number(rv) / 100 * 255;
                            const alpha = Math.exp(-2.73 * Number(rv) / 100);
                            const bgColor = `rgba(${red},${green},0,${alpha})`;

                            return (
                              <td key={j} className="artifact-cell font-semibold" style={{ backgroundColor: bgColor }}>
                                {rv}
                              </td>
                            );
                          })}
                        </tr>
                      )))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="bg-gray-600 mx-auto p-2 rounded-lg mt-6 max-w-2xl">
        <p className="text-sm font-semibold text-white text-center">
          How it works:
        </p>
        <p className="text-sm text-white text-left ml-1">
          <ul className="list-disc ml-4 mt-1 space-y-2">
            <li>Characters have a table with weightings based on how much a substat has/will increase their total damage.</li>
            <li>The starting values for a character come from their most popular team and rotation.</li>
            <li>The weightings are used to calculate a maximum value for an artifact slot, and the equipped artifact strength is given as a percentage of that maximum.</li>
            <li>Characters are then ranked by an average gear score.</li>
          </ul></p>
      </div>

      <h2 className="mt-8 mb-4 text-4xl font-bold text-white text-center">Editable Weights</h2>
      <div className="overflow-x-auto mx-auto">
        {characterData && (
          <table className="table-auto bg-blue shadow-md rounded-lg min-w-min mx-auto">
            <thead>
              <tr className="bg-gray-200 text-gray-600 text-sm uppercase leading-normal">
                <th className="py-3 px-6 text-left">Character</th>
                <th className="py-3 px-6 text-left">HP</th>
                <th className="py-3 px-6 text-left">ATK</th>
                <th className="py-3 px-6 text-left">DEF</th>
                <th className="py-3 px-6 text-left">HP%</th>
                <th className="py-3 px-6 text-left">ATK%</th>
                <th className="py-3 px-6 text-left">DEF%</th>
                <th className="py-3 px-6 text-left">CR</th>
                <th className="py-3 px-6 text-left">CDMG</th>
                <th className="py-3 px-6 text-left">ER</th>
                <th className="py-3 px-6 text-left">EM</th>
              </tr>
            </thead>
            <tbody>
              {/* {Object.entries(teams).map(([character, values], characterIndex) => (
                <tr key={characterIndex} style={{ backgroundColor: "transparent" }}>
                  <td className="py-3 px-6 text-left text-gray-200 align-top">{character}</td>
                  {values.map((value, index) => (
                    <td key={index} className="p-0 align-top">
                      <input
                        type="number"
                        value={value}
                        onChange={(event) => handleChange(character, index, event)}
                        className="w-full h-full border text-white text-center m-0"
                        style={{ backgroundColor: '#08192b', fontSize: '0.875rem', borderRadius: '0', height: '100%' }} // Custom styles for text size and padding
                        step="any"
                      />
                    </td>
                  ))}
                </tr>
              ))} */}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex justify-center mt-4">
        <button onClick={() => handleUIDSubmit(uid)} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 text-lg font-semibold">
          Update
        </button>
      </div>
    </div>
  );
};

export default HomePage;