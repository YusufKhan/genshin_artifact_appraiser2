'use client';

import { CharacterDetail } from 'genshin-manager';
import React, { useState, useEffect } from 'react';

/* const startingWeights = { //%gain for character damage from one AVERAGE roll
  //              HP      ATK     DEF     HP%     ATK%    DEF%    CR      CDMG    ER      EM 
  Alhatham: [0, 0.3, 0, 0, 0.8, 0, 2.2, 2.3, 0, 1.1],
  Arlecchino: [0, 0.49, 0, 0, 1.51, 0, 2.95, 2.33, 0, 1.33],
  Hutao: [0.62, 0.5, 0, 1.88, 1.07, 0, 3.2, 2.16, 0, 2.36],
  Shougun: [0, 0.53, 0, 0, 1.34, 0, 2.92, 2.43, 1.1, 0],
  Fischl: [0, 0.63, 0, 0, 1.41, 0, 2.62, 2.88, 0, 1.43],
  Furina: [0.93, 0, 0, 2.78, 0, 0, 1.19, 2.58, 0, 0],
  Eula: [0, 0.79, 0, 0, 2.4, 0, 1.57, 2.36, 0, 0],
} */

const HomePage = () => {

  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState(''); // Define the uid state
  const [characterData, setCharacterData] = useState<CharacterDetail[]>();
  const [weights, setWeights] = useState();
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

    if (savedCharacterData) {
      setCharacterData(JSON.parse(savedCharacterData));
    } else {
      console.error('No saved characters');
    }

    //Separate from above so they can be cleared independently
    if (savedWeights) {
      setWeights(JSON.parse(savedWeights));
    } else {
      console.error('No weights table saved');
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

      const data = await response.json() as CharacterDetail[];
      setCharacterData(data);

      localStorage.setItem('uid', uid); // Cache the UID
      localStorage.setItem('characterData', JSON.stringify(characterData));
      localStorage.setItem('weights', JSON.stringify(weights));

      //console.log(characterData);
      console.log(data[0].name);

    } catch (error) {
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto p-4">
      <section className="hero flex items-center justify-center text-center bg-gray-900 py-12">
        <div className="hero-content">
          <h1 className="text-4xl font-bold text-white">Genshin Impact Artifact Analyzer</h1>
          <p className="mt-4 text-lg text-white">Analyze and enhance your character&apos;s artifact builds with Enka data.</p>
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
            className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-2 w-full max-w-md"
          />
          <button onClick={() => handleUIDSubmit(uid)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Submit
          </button>
          {loading && (
            <div className="loading-screen">
              <div className="spinner"></div>
              <p className="loading-text">Loading...</p>
            </div>
          )}
          {error && (
            <div className="error-message text-red-500 mt-4">
              <p>{error}</p>
            </div>)}
          {/* </div></form> */}
        </div>
      </section>
      {(
        <section className="character-section py-8">
          <h2 className="text-3xl font-semibold text-center text-white mb-2">Character Data</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto bg-black shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Character</th>
                  <th className="py-3 px-6 text-left">Flower</th>
                  <th className="py-3 px-6 text-left">Feather</th>
                  <th className="py-3 px-6 text-left">Sands</th>
                  <th className="py-3 px-6 text-left">Goblet</th>
                  <th className="py-3 px-6 text-left">Circlet</th>
                  <th className="py-3 px-6 text-left">Combined RV</th>
                </tr>
              </thead>
              <tbody>
                {characterData && (
                  characterData.map((character, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-6 text-left whitespace-nowrap">{character.name}</td>
                      {character.artifacts.map((artifact, j) => {
                        /* const red = 255 - Number(value) / 100 * 255;
                        const green = Number(value) / 100 * 255;
                        const alpha = 1 - Number(value) / 100;
                        const color = `rgba(${red},${green},0,${alpha})`; */
                        return (
                          <td key={j} className="artifact_cell">
                            {artifact.subStats[0].value}
                          </td>
                        );
                      })}
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <h2 className="mt-6 text-3xl font-semibold text-center text-white">Editable Weights</h2>
      <div className="overflow-x-auto">
        {characterData && (
          <table className="min-w-full table-auto bg-blue shadow-md rounded-lg">
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
        <button onClick={() => handleUIDSubmit(uid)} className="px-4 py-2 bg-blue-500 text-white rounded">
          Update
        </button>
      </div>
    </div>
  );
};

export default HomePage;