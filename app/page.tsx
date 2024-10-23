'use client';
import { CharacterDetail } from 'genshin-manager';
import React, { useState, useEffect } from 'react';

interface Teams {
  [charName: string]: number[];
}

const HomePage = () => {

  const [loading, setLoading] = useState(false); // Loading circle
  const [uid, setUid] = useState(''); // UID fed to getCharacterData
  const [characterData, setCharacterData] = useState<CharacterDetail[]>([]); // Received from getCharacterData
  const [weights, setWeights] = useState<Teams | undefined>(undefined); // For resetting weights with button
  const [setWeightsTrigger, setWeightsSet] = useState(false); // Action triggers await handling of update in useEffect
  const [rollValues, setRollValues] = useState<(string | number)[][]>([]); // The final character RV table
  const [error, setError] = useState('');

  useEffect(() => {

    if (setWeightsTrigger) { // Hook to reset weights
      console.log("Reloading and not retrieving weights table from storage");
      const weightsTable = new weightsStartingTable();
      localStorage.setItem('weights', JSON.stringify(weightsTable.teams));
      setWeightsSet(false);
    }

    else {
      // Load cached data from browser localStorage
      const savedUID = localStorage.getItem('uid');
      const savedCharacterData = localStorage.getItem('characterData');
      const savedRVs = localStorage.getItem('rollValues')
      const savedWeights = localStorage.getItem('weights');

      try {

        if (savedUID) {
          setUid(savedUID);
          console.info('Stored UID loaded');
        }

        if (savedCharacterData) {
          setCharacterData(JSON.parse(savedCharacterData));
          console.info('Stored characters loaded');
        }

        if (savedRVs) {
          setRollValues(JSON.parse(savedRVs));
          console.info('Stored RV table loaded');
        }

        //Separate from above so they can be cleared independently
        if (savedWeights) {
          setWeights(JSON.parse(savedWeights));
          console.info('Stored weights table loaded');
        } else {
          console.info('No weights table saved. Loading default');
          const weightsTable = new weightsStartingTable(); // Setting weights table to default
          setWeights(weightsTable.teams);
        }

      } catch (error) {
        console.log(error);
      }
    }
  }, [setWeightsTrigger, setWeightsSet]);

  const handleChange = (character: string, index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle change in a cell of the weights table
    const newValue = event.target.value;
    setWeights((prevWeights) => {
      if (!prevWeights) {
        console.error('prevWeights is null or undefined');
        return prevWeights; // Should always be defined due to useEffect logic
      }
      const updatedCharacter = [...prevWeights[character]];
      updatedCharacter[index] = parseFloat(newValue);

      return { ...prevWeights, [character]: updatedCharacter };
    });
  }

  const updateRVs = async () => {
    const response = await fetch('api/requestCalcRVs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ characterData, weights }),
    });

    const updatedRVs: (string | number)[][] = await response.json();

    setRollValues(updatedRVs);
    localStorage.setItem('rollValues', JSON.stringify(updatedRVs));
    return updatedRVs;
  }

  const handleUIDSubmit = async (uid: string) => {
    setUid(uid)
    setError("")
    setLoading(true);

    if (typeof window !== 'undefined') {

      try {

        console.time("Fetch Enka data")
        const response = await fetch('api/getCharacterData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid }),
        });
        console.timeEnd('Fetch Enka data');

        const newCharacterData: CharacterDetail[] = await response.json();
        setCharacterData(newCharacterData);

        const newRollValues = await updateRVs();
        setRollValues(newRollValues);

        console.log({ characterData, weights, rollValues });

        localStorage.setItem('uid', uid);
        localStorage.setItem('characterData', JSON.stringify(newCharacterData));
        localStorage.setItem('rollValues', JSON.stringify(newRollValues));

      } catch (error) {
        setError(String(error));

      } finally {
        setLoading(false);
      }

    }
  };

  return (

    <div className="container mx-auto p-4">

      <section className="hero flex items-center justify-center text-center bg-transparent py-4">
        <div className="hero-content">

          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Genshin Impact Artifact Analyzer</h1>

          <div className="flex justify-center items-center mt-6">
            <input // UID entry field
              type="text"
              placeholder="Enter UID"
              value={uid}
              onChange={(event) => setUid(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') { // Enter or click to submit
                  handleUIDSubmit(uid);
                }
              }} // Input text box design
              className="bg-white text-black text-lg font-semibold text-center border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-2 max-w-sm" />

            <button
              onClick={() =>
                handleUIDSubmit(uid)
              }
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 text-lg font-semibold">
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

        </div>
      </section>

      <section className="character-section py-2">
        <h2 className="mt-2 mb-4 text-4xl font-bold text-white text-center">Character Data</h2>
        <div className="overflow-x-auto mx-auto">
          <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-lg">

            {characterData && (
              <table className="table-auto w-full">

                <thead className="bg-gray-600">
                  <tr className="text-white uppercase">
                    <th className="py-3 px-6 text-center font-semibold border-r border-gray-100">Character</th>
                    <th className="py-3 px-6 text-center border-r border-gray-100">Flower</th>
                    <th className="py-3 px-6 text-center border-r border-gray-100">Feather</th>
                    <th className="py-3 px-6 text-center border-r border-gray-100">Sands</th>
                    <th className="py-3 px-6 text-center border-r border-gray-100">Goblet</th>
                    <th className="py-3 px-6 text-center border-r border-gray-100">Circlet</th>
                    <th className="py-3 px-6 text-center border-l-2 border-blue-950">Combined</th>
                  </tr>
                </thead>

                <tbody>
                  {rollValues.length > 0 && (
                    rollValues.map((character, index) => (
                      <tr key={index} className=" bg-white ">
                        <td className="py-3 px-6 text-right text-black font-semibold whitespace-nowrap bg-gray-300 border-r border-t border-gray-100">{character[0]}</td>
                        {character.slice(1).map((rv, artifactSlot) => { // Remove name from array then make row of colored RVs
                          const red = 255 - Number(rv) / 100 * 255; // Lower number is more red
                          const green = Number(rv) / 100 * 255;
                          const alpha = Math.exp(-2.71828 * Number(rv) / 100); // Euler number log scaling alpha up with lower number
                          const bgColor = `rgba(${red},${green},0,${alpha})`;
                          const borderStyle = artifactSlot === character.length - 2 ? '2px solid #172554' : 'none';
                          return ( // RV value and color
                            <td key={artifactSlot} className="artifact-cell font-semibold" style={{ backgroundColor: bgColor, borderLeft: borderStyle, borderRight: borderStyle }}>{rv}</td>
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

      <div className="bg-gray-600 mx-auto p-4 mt-6 max-w-2xl rounded-lg ">
        <p className="font-semibold text-white text-center">
          How it works:
        </p>
        <ul className="list-disc p-6 space-y-2 text-white">
          <li>Characters have a table with weightings based on how much a single max value substat roll has/will increase their total damage.</li>
          <li>The starting values for a character come from their most popular team and rotation but those weights can be adjusted below.</li>
          <li>The weightings are used to calculate a maximum value for an artifact slot, and the equipped artifact strength is given as a percentage of that maximum.</li>
          <li>Characters are then ranked by an average gear score.</li>
          <li>Character data, this roll values table and your edited weights table are stored on your browser</li>
        </ul>
      </div>

      <h2 className="mt-8 mb-4 text-4xl font-bold text-white text-center">Editable Weights</h2>
      <div className="overflow-x-auto mx-auto">
        {characterData.length > 0 && (
          <table className="w-full max-w-[900px] mx-auto rounded-lg overflow-hidden">

            <thead>
              <tr className="bg-gray-600 text-white uppercase leading-normal ">
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
              {weights && (
                Object.entries(weights).map(([character, values], characterIndex) => (
                  <tr key={characterIndex} >
                    <td className="py-3 px-6 text-center text-white font-semibold border-r border-gray-300 bg-gray-600 h-full">{character}</td>
                    {values.map((value, index) => (
                      <td key={index} style={{ height: '100%', padding: 0 }}>
                        <input
                          type="number"
                          value={value}
                          onChange={(event) => handleChange(character, index, event)}
                          onWheel={(event) => event.currentTarget.blur()}
                          aria-label="Character damage % improvement for substat: "
                          className="w-full text-white text-center m-0 h-full border-t"
                          style={{ backgroundColor: '#172554', outline: 'none' }}
                          step="any"
                        />
                      </td>
                    ))}
                  </tr>
                ))
              )};
            </tbody>
          </table>
        )}
      </div>
      <div className="flex justify-center mt-4">

        <button
          onClick={() => {
            updateRVs();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-4 py-2 m-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 text-lg font-semibold">
          Recalculate RVs
        </button>

        <button
          onClick={() => {
            setWeightsSet(true);
            updateRVs();
          }}
          className="px-4 py-2 m-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 text-lg font-semibold">
          Reset weights
        </button>

      </div>
    </div>
  );
};

class weightsStartingTable {
  public teams: Teams;

  constructor() {
    this.teams = {
      Alhaitham: [0, 0.3, 0, 0, 0.8, 0, 2.2, 2.3, 0, 1.1],
      Arlecchino: [0, 0.49, 0, 0, 1.51, 0, 2.95, 2.33, 0, 1.33],
      'Hu Tao': [0.62, 0.5, 0, 1.88, 1.07, 0, 3.2, 2.16, 0, 2.36],
      Shougun: [0, 0.53, 0, 0, 1.34, 0, 2.92, 2.43, 1.1, 0],
      Fischl: [0, 0.63, 0, 0, 1.41, 0, 2.62, 2.88, 0, 1.43],
      Furina: [0.93, 0, 0, 2.78, 0, 0, 1.19, 2.58, 0, 0],
      Eula: [0, 0.79, 0, 0, 2.4, 0, 1.57, 2.36, 0, 0]
    };
  }
  getTeams(): Teams {
    return this.teams;
  }
}

export default HomePage;