import { WeightsData, UserData, CharacterRollValues } from "./interfaces";
import { StatReferences } from "./statReferences";

export function calculateRVs(data: UserData, weights: WeightsData) {
  const allCharacterRVs: CharacterRollValues[] = [];
  const maxStatRoll = StatReferences.maxStatRoll as {
    [key: string]: { name: string; maxValue: number };
  };
  const statNames = StatReferences.statNames as string[];
  const artifactOrder = StatReferences.artifactOrder as string[];

  // CHARACTER LOOP
  for (let j = 0; j < data.avatarInfoList.length; j++) {
    // Get character ID
    const target = data.avatarInfoList[j];
    const charId = target.avatarId;

    // If unknown character, add default weights line
    // Resulting weights table can be edited by user, and is saved to that charID
    if (!weights[charId]) {
      weights[charId] = {
        weights: [0, 0.0, 0, 0.0, 0.0, 0, 2.3, 2.3, 0.0, 0.0],
        name: "Unknown:" + charId,
        energyNeeded: 20,
      };
    }

    // Get other character details
    const charWeightsAndER = weights[charId];
    const charName = weights[charId]?.name;

    // Filter list to only artifacts (weapon removed)
    let artifacts = target.equipList.filter((artifact) => artifact.reliquary);

    // Doesn't put artifact in right slot if some missing, so skip character
    if (artifacts.length < 5) {
      continue;
    }

    // Sort artifacts to usual slot order for final display
    artifacts = artifacts.sort(
      (a, b) =>
        artifactOrder.indexOf(a.flat.equipType) -
        artifactOrder.indexOf(b.flat.equipType)
    );

    // Every ER roll reduces the ceiling for a slot that has an ER sub
    // All ER rolls discounted, extras will be added back as penalty
    let erSubsTotal = 0;
    let slotsWithErCount = 0;
    const slotHasErArray: boolean[] = [];
    for (let i = 0; i < artifacts.length; i++) {
      const artifact = artifacts[i]; // This artifact

      // Skip if substats missing
      if (artifact.flat.reliquarySubstats.length < 4) {
        continue; // Skip if substats missing
      }

      // Check for ER substats and and add to counts / slot arrays
      artifact.flat.reliquarySubstats.forEach((stat) => {
        const substatType = stat.appendPropId as string;
        if (substatType == "FIGHT_PROP_CHARGE_EFFICIENCY") {
          slotHasErArray.push(true);
          slotsWithErCount++;
          erSubsTotal += stat.statValue;
        } else {
          slotHasErArray.push(false);
        }
      });
    }

    // How many perfect ER subs needed
    const rollsNeeded = Math.ceil(
      Math.round((charWeightsAndER.energyNeeded / 6.48) * 10) / 10
    );

    // For when total ER can be reached with fewer rolls
    const erSubsEqvCount = Math.ceil(
      Math.round(
        (erSubsTotal / maxStatRoll["FIGHT_PROP_CHARGE_EFFICIENCY"].maxValue) *
          10
      ) / 10
    );

    // If too much ER, penalty distributed among slots with ER subs
    const erPenalty =
      erSubsEqvCount > rollsNeeded
        ? (erSubsEqvCount - rollsNeeded) / slotsWithErCount
        : 0;

    const thisCharactersRVs = [];
    const thisCalcBreakdown: string[] = []; // Shown on hover label
    let characterTotal = 0; // For calculating average RV

    // MAIN ARTIFACT RV CALC LOOP
    // Substat values will be rounded to 0.1 since Enka data is rounded
    for (let i = 0; i < artifacts.length; i++) {
      const thisArtifact = artifacts[i];
      /** String explaining RV calc eg 3.2*CDMG */
      const breakdownSlotCalcArray: string[] = [];
      let discountRollsER = 0; // All ER rolls discounted, if character needs ER

      if (thisArtifact.flat.reliquarySubstats.length < 4) {
        continue;
      }

      // Loops through this artifacts substats
      const artifactRV = thisArtifact.flat.reliquarySubstats
        .map((stat) => {
          const substatType = stat.appendPropId as string;

          // Fixed order for substat types. Always referencing statReferences index
          const substatIndex = Object.keys(maxStatRoll).indexOf(substatType);
          const substatWeight = charWeightsAndER.weights[substatIndex] ?? 0;

          // Substat equivalent no. of max rolls
          const subMaxRollEqv =
            Math.round(
              (stat.statValue / maxStatRoll[substatType].maxValue) * 10
            ) / 10;

          // ER is dealt with separately
          if (
            substatType == "FIGHT_PROP_CHARGE_EFFICIENCY" &&
            charWeightsAndER.energyNeeded > 0
          ) {
            discountRollsER = Math.ceil(subMaxRollEqv); // Array of ER rolls to discount
            // If ER needed, all ER rolls discounted, penalty added back later if ER overcapped
          }

          if (substatWeight > 0) {
            breakdownSlotCalcArray.push(
              `${subMaxRollEqv.toFixed(1)}*${
                statNames[substatIndex]
              }(${substatWeight})`
            );
          }
          return subMaxRollEqv * substatWeight; // Returns this artifact's RV
        })
        .reduce((a, b) => a + b, 0); // Sums RV for all of this artifact's substats

      // Next the RV max array needs to be built
      const mainStat = thisArtifact.flat.reliquaryMainstat.mainPropId as string;
      const mainStatIndex = Object.keys(maxStatRoll).indexOf(mainStat);

      //const erWeight = charWeightsAndER.weights[8];
      /** Main stat removed */
      /*const filteredWeights = charWeightsAndER.weights.filter(
        (_, index) => index !== mainStatIndex
      );
      // Copy and sort weights, keeping track of indices
      const sortedWeightsWithIndices = filteredWeights
        .map((weight, index) => ({ weight, index })) // Create array of objects with weight and index
        .sort((a, b) => b.weight - a.weight); // Sort by weight in descending order
      // Extract sorted weights
      const sortedWeights = sortedWeightsWithIndices.map(
        (entry) => entry.weight
      );
      // Use indices to create sorted list of weight names
      const sortedWeightStatNames = sortedWeightsWithIndices.map((entry) => {
        return statNames[entry.index];
      });*/

      // Need array of indices of best weights, so specific ones can be removed
      let indices = charWeightsAndER.weights.map((_, index) => index);
      indices.sort(
        // Sort indices based on the values in `weights`
        (a, b) => charWeightsAndER.weights[b] - charWeightsAndER.weights[a]
      );

      // Remove main stat, ER index
      const unwantedIndices = [mainStatIndex, 8];
      indices = indices.filter((index) => !unwantedIndices.includes(index));

      let thisRVMax = // Calculates RV Max
        (7 - discountRollsER) * charWeightsAndER.weights[indices[0]] +
        charWeightsAndER.weights[indices[1]] +
        charWeightsAndER.weights[indices[2]] +
        charWeightsAndER.weights[8] * discountRollsER; // Non-zero if ER contributes to DMG

      //let rvSlotPenalty = 0;
      if (slotHasErArray[i]) {
        // If slot has ER, apply penalty if penalty not zero
        thisRVMax +=
          (erPenalty *
            (charWeightsAndER.weights[indices[0]] *
              charWeightsAndER.weights[indices[1]])) / // Penalty RV is average of top 2 subs
          2;
        //rvSlotPenalty = erPenalty; // Not zero if slot has ER
      }

      // If penalty, need to minus max RV gained by ER roll(whether its zero or not)
      let lastStatMultiplier = 0;
      // If no ER, then can add 4th highest stat
      if (discountRollsER == 0) {
        thisRVMax += charWeightsAndER.weights[indices[3]];
        lastStatMultiplier = 1;
      }

      thisCharactersRVs.push(((artifactRV / thisRVMax) * 100).toFixed(0));
      characterTotal += (artifactRV / thisRVMax) * 100;

      // Calc breakdown for this artifact eg 2.2*CR + 0.8*CDMG + 0.7*ATK%
      try {
        // Add this artifact calc breakdown
        let combinedString = breakdownSlotCalcArray[0];
        for (let i = 1; i < breakdownSlotCalcArray.length; i++) {
          combinedString += " + ";
          combinedString += breakdownSlotCalcArray[i];
        }
        let hoverLabel = `This Artifact: ${combinedString} = ${artifactRV.toFixed(
          1
        )}\n`;

        // If this artifact has an ER substat, show reduced ceiling
        if (discountRollsER > 0) {
          hoverLabel += `Lowering ceiling for ${discountRollsER} ER substats\n`;

          // If this build has extra ER rolls -> adding back discounted rolls
          if (erPenalty > 0 && slotHasErArray[i]) {
            hoverLabel += `Distributed penalty for excess ER: ${(
              erPenalty / slotsWithErCount
            ).toFixed(1)}*Best weight(${
              charWeightsAndER.weights[indices[0]]
            })\nAssuming ${
              erSubsEqvCount - rollsNeeded // Extra ER rolls across build
            } ER roll(s) can be replaced with best stat\n`;
            // Better if we count the stats eg 3 slots with 18CR(ie maxed best stat), 2CDMG, etc so have to use CDMG instead
          }

          // Will have at least 1 discount roll in this condition body
          else {
            hoverLabel += `RV Ceiling: ${7 - discountRollsER}*${
              statNames[indices[0]]
            }`;
            // Now ER may need to replace the 4th substat in the Perfect RV for slot calc, if it isn't there already
          }
        }
        // If 0 ER, "6x best stat" ceiling
        else {
          hoverLabel += `RV Ceiling: 6*${statNames[indices[0]]}(${
            charWeightsAndER.weights[indices[0]]
          })`;
        }

        hoverLabel +=
          ` + 1*${statNames[indices[1]]}` + ` + 1*${statNames[indices[2]]}`;
        if (lastStatMultiplier > 0) {
          hoverLabel += ` + ${lastStatMultiplier}*${statNames[indices[3]]}`;
        }
        if (charWeightsAndER.weights[8] > 0 && discountRollsER > 0) {
          // Adding ER and multiplier if ER was discounted from ceiling
          hoverLabel += ` + ${discountRollsER}*ER`;
        }
        hoverLabel += ` = ${thisRVMax.toFixed(1)}`;

        thisCalcBreakdown.push(hoverLabel);
      } catch (error) {
        console.error("Error accessing array elements:", error);
        thisCalcBreakdown.push("No useful substat");
      }
    }
    // ARTIFACT LOOP END

    thisCharactersRVs.push((characterTotal / 5).toFixed(0));
    allCharacterRVs.push({
      rollValues: thisCharactersRVs,
      name: charName,
      id: charId,
      calcBreakdown: thisCalcBreakdown,
    });
  }
  // CHARACTER LOOP END

  // Sort character list based on total RV score
  allCharacterRVs.sort((a, b) => {
    const numA = Number(a.rollValues[a.rollValues.length - 1]);
    const numB = Number(b.rollValues[b.rollValues.length - 1]);
    // Compare the numbers
    return numA - numB;
  });

  return { allCharacterRVs, weights }; // Need to return weights since unknown character may have been added
}
