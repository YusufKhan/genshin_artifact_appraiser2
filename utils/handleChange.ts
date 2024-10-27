import { CharacterWeights, WeightsData } from "./interfaces";

export const handleChange = (
  characterId: string,
  index: number,
  event: React.ChangeEvent<HTMLInputElement>,
  setWeights: React.Dispatch<React.SetStateAction<WeightsData>>
) => {
  const newValue = parseFloat(event.target.value);

  setWeights((prevWeights) => {
    if (!prevWeights) {
      console.error("prevWeights is null or undefined");
      return prevWeights;
    }

    // Copy the character weights properly
    const updatedCharacter: CharacterWeights = {
      ...prevWeights[characterId],
      weights: [...prevWeights[characterId].weights],
    };

    // Update the specific weight
    updatedCharacter.weights[index] = newValue;

    // Create the new weights object ensuring correct typing
    const newWeights: WeightsData = {
      ...prevWeights,
      [characterId]: updatedCharacter,
    };

    // Save to localStorage
    localStorage.setItem("weights", JSON.stringify(newWeights));

    return newWeights;
  });
};
