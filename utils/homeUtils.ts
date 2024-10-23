import { CharacterDetail } from 'genshin-manager';
import { calculateRVs } from './calcRVs';

export interface WeightsTable {
    [charName: string]: number[];
}

export type RollValues = (string | number)[][];

export const handleChange = (
    character: string,
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
    setWeights: React.Dispatch<React.SetStateAction<WeightsTable>>
) => {
    // Handle change in a cell of the weights table
    const newValue = event.target.value;
    setWeights((prevWeights) => {
        if (!prevWeights) {
            console.error('prevWeights is null or undefined');
            return prevWeights; // Should always be defined due to useEffect logic
        }
        const updatedCharacter = [...prevWeights[character]];
        updatedCharacter[index] = parseFloat(newValue);
        const newWeights = { ...prevWeights, [character]: updatedCharacter };

        localStorage.setItem('weights', JSON.stringify(newWeights)); // Save to localStorage

        return newWeights;
    });
};


export const getCharacterData = async (
    newUID: string,
    setUid: React.Dispatch<React.SetStateAction<string>>,
    setError: React.Dispatch<React.SetStateAction<string>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    //setCharacterData: React.Dispatch<React.SetStateAction<CharacterDetail[]>>
): Promise<CharacterDetail[]> => {

    if (typeof window !== 'undefined') {
        localStorage.setItem('uid', newUID);
        setUid(newUID)
        setError("")
        setLoading(true);

        try {
            console.time("Fetch Enka data")
            const response = await fetch('api/getCharacterData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid: newUID }),
            });
            console.timeEnd('Fetch Enka data');

            const newCharacterData: CharacterDetail[] = await response.json();
            localStorage.setItem('characterData', JSON.stringify(newCharacterData));
            localStorage.setItem('characterData', JSON.stringify(newCharacterData));
            setLoading(false);
            return newCharacterData;
        } catch (error) {
            setLoading(false);
            setError(String(error));
            return [];
        }
    }
    return [];
};

export const onClick = async (
    newUID: string,
    setUid: React.Dispatch<React.SetStateAction<string>>,
    setError: React.Dispatch<React.SetStateAction<string>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setCharacterData: React.Dispatch<React.SetStateAction<CharacterDetail[]>>,
    weights: WeightsTable,
    setRollValues: React.Dispatch<React.SetStateAction<RollValues>>
) => {
    const newCharacterData = await getCharacterData(newUID, setUid, setError, setLoading) as CharacterDetail[]; // Type assertion here
    localStorage.setItem('characterData', JSON.stringify(newCharacterData));
    setCharacterData(newCharacterData);

    const newRollValues = calculateRVs(newCharacterData, weights);
    localStorage.setItem('rollValues', JSON.stringify(newRollValues));
    setRollValues(newRollValues);
};