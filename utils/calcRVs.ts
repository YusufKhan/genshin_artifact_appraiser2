import { WeightsData, UserData, CharacterRollValues } from "./interfaces";

export function calculateRVs(data: UserData, weights: WeightsData) {
  const substatMaxValues: { [key: string]: number } = {
    FIGHT_PROP_HP: 298.75,
    FIGHT_PROP_ATTACK: 19.45,
    FIGHT_PROP_DEFENSE: 23.15,
    FIGHT_PROP_HP_PERCENT: 5.83,
    FIGHT_PROP_ATTACK_PERCENT: 5.83,
    FIGHT_PROP_DEFENSE_PERCENT: 7.29,
    FIGHT_PROP_CRITICAL: 3.89,
    FIGHT_PROP_CRITICAL_HURT: 7.77,
    FIGHT_PROP_CHARGE_EFFICIENCY: 6.48,
    FIGHT_PROP_ELEMENT_MASTERY: 23.31,
  };

  const statNames: string[] = [
    "HP", // FIGHT_PROP_HP
    "ATK", // FIGHT_PROP_ATTACK
    "DEF", // FIGHT_PROP_DEFENSE
    "HP%", // FIGHT_PROP_HP_PERCENT
    "ATK%", // FIGHT_PROP_ATTACK_PERCENT
    "DEF%", // FIGHT_PROP_DEFENSE_PERCENT
    "CR", // FIGHT_PROP_CRITICAL
    "CDMG", // FIGHT_PROP_CRITICAL_HURT
    "ER", // FIGHT_PROP_CHARGE_EFFICIENCY
    "EM", // FIGHT_PROP_ELEMENT_MASTERY
  ];

  const allCharacterRVs: CharacterRollValues[] = [];

  // -----
  // CHARACTER LOOP
  // -----
  for (let j = 0; j < data.avatarInfoList.length; j++) {
    const target = data.avatarInfoList[j];
    const artifacts = target.equipList;
    const charId = target.avatarId;

    // Add default weights TO WEIGHTS TABLE if unknown character
    // Can be edited by user
    if (!weights[charId]) {
      weights[charId] = {
        weights: [0, 0.0, 0, 0.0, 0.0, 0, 2.3, 2.3, 0.0, 0.0],
        name: "Unknown char: Def weights \n" + charId,
        energyNeeded: 20,
      };
    }

    // Get data from weights table
    const charWeights = weights[charId];
    const charName = weights[target.avatarId]?.name || target.avatarId;

    // Ensure character artifacts are in the right order
    const artifactOrder = [
      "EQUIP_BRACER",
      "EQUIP_NECKLACE",
      "EQUIP_SHOES",
      "EQUIP_RING",
      "EQUIP_DRESS",
    ];
    const orderedArtifacts = artifacts.sort(
      (a, b) =>
        artifactOrder.indexOf(a.flat.equipType) -
        artifactOrder.indexOf(b.flat.equipType)
    );

    const thisCharactersRVs = [];
    const thisCalcBreakdown: string[] = []; // Shown on hover label
    let characterTotal = 0; // Average gear score

    // -----
    // ARTIFACT LOOP
    // -----
    for (let i = 0; i < artifacts.length; i++) {
      const artifact = orderedArtifacts[i];
      const thisSubstatCalcBreakdown: string[] = [];

      // Skip artifacts without Reliquary tag
      if (!artifact.reliquary) {
        continue;
      }

      if (artifact.flat.reliquarySubstats.length < 4) {
        console.log("Missing substat on ${target}'s artifact slot:${i}");
        continue;
      }

      // -----
      // SUBSTAT LOOP
      // -----
      const rv = artifact.flat.reliquarySubstats
        .map((stat) => {
          // Gets substat index to find character specific substat weight
          const substatType = stat.appendPropId as string;
          const substatIndex =
            Object.keys(substatMaxValues).indexOf(substatType);
          const substatWeight = charWeights.weights[substatIndex] ?? 0;

          // Substat eqv no. of max rolls
          const subMaxRollEqv = stat.statValue / substatMaxValues[substatType];

          // String explaining RV calc eg 3.2x (CDMG: 2.3)
          if (substatWeight > 0) {
            // Only adding if weight > 0
            thisSubstatCalcBreakdown.push(
              `${subMaxRollEqv.toFixed(1)}x (${
                statNames[substatIndex]
              }: ${substatWeight})`
            );
          }
          return subMaxRollEqv * substatWeight;
        })
        .reduce((a, b) => a + b, 0);
      // -----
      // SUBSTAT LOOP END
      // -----

      // Find the index of the main stat
      const mainStat = artifact.flat.reliquaryMainstat.mainPropId as string;
      const index = Object.keys(substatMaxValues).indexOf(mainStat);

      // Get indices of 4 highest substat multipliers that aren't the main stat
      const highestIndices: number[] = [];
      for (let i = 0; i < 4; i++) {
        let maxIndex: number = -1;
        let maxValue: number = Number.MIN_SAFE_INTEGER;
        for (let j = 0; j < charWeights.weights.length; j++) {
          if (
            j !== index &&
            !highestIndices.includes(j) &&
            charWeights.weights[j] > maxValue
          ) {
            maxValue = charWeights.weights[j];
            maxIndex = j;
          }
        }
        if (maxIndex !== -1) {
          highestIndices.push(maxIndex);
        }
      }

      const thisRVMax =
        6 * charWeights.weights[highestIndices[0]] +
        charWeights.weights[highestIndices[1]] +
        charWeights.weights[highestIndices[2]] +
        charWeights.weights[highestIndices[3]];
      thisCharactersRVs.push(((rv / thisRVMax) * 100).toFixed(0));
      characterTotal += (rv / thisRVMax) * 100;
      // Calc breakdown eg Max RV is 6x CR + 1x CDMG, ATK%, HP%
      try {
        let combinedString = thisSubstatCalcBreakdown[0];
        for (let i = 1; i < thisSubstatCalcBreakdown.length; i++) {
          combinedString += " + ";
          combinedString += thisSubstatCalcBreakdown[i];
        }
        thisCalcBreakdown.push(
          `This artifact: ${combinedString} = ${rv.toFixed(1)}` +
            `\nMax rolls x weights: 6x ${statNames[highestIndices[0]]} + 1x ` +
            `${statNames[highestIndices[1]]}, ${
              statNames[highestIndices[2]]
            }, ${statNames[highestIndices[3]]} = ` +
            `${thisRVMax.toFixed(1)}`
        );
      } catch (error) {
        console.error("Error accessing array elements:", error);
        thisCalcBreakdown.push("No useful substat");
      }
    }
    // -----
    // ARTIFACT LOOP END
    // -----

    thisCharactersRVs.push((characterTotal / 5).toFixed(0));
    allCharacterRVs.push({
      rollValues: thisCharactersRVs,
      name: charName,
      id: charId,
      calcBreakdown: thisCalcBreakdown,
    });
  }
  // -----
  // CHARACTER LOOP END
  // -----

  // Sort character list based on total RV score
  allCharacterRVs.sort((a, b) => {
    const numA = Number(a.rollValues[a.rollValues.length - 1]);
    const numB = Number(b.rollValues[b.rollValues.length - 1]);
    // Compare the numbers
    return numA - numB;
  });

  return { allCharacterRVs, weights }; // Need to return weights since unknown character may have been added
}
