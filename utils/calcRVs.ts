import { WeightsData, UserData, CharacterRollValues } from "./interfaces";
import { StatReferences } from "./statReferences";

export function calculateRVs(data: UserData, weights: WeightsData) {
  const allCharacterRVs: CharacterRollValues[] = [];
  const maxStatRoll = StatReferences.maxStatRoll;
  const statNames = StatReferences.statNames;

  // CHARACTER LOOP
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
    const charName = weights[charId]?.name || target.avatarId; // Set name to ID if unknown (new character)

    // ER needed must be positive, other weights too

    const artifactOrder = [
      "EQUIP_BRACER",
      "EQUIP_NECKLACE",
      "EQUIP_SHOES",
      "EQUIP_RING",
      "EQUIP_DRESS",
    ];
    // Ensure character artifacts are in the right order
    const orderedArtifacts = artifacts.sort(
      (a, b) =>
        artifactOrder.indexOf(a.flat.equipType) -
        artifactOrder.indexOf(b.flat.equipType)
    );

    // On ER target - Every ER roll reduces the ceiling for a slot that has an ER sub
    // Extra ER rolls: Each slot with an ER roll, gets ceiling raised by extra rolls/slots * Ave of weights 1,2
    const rollsNeeded = Math.ceil(charWeights.energyNeeded / 6.48); // Divided by max ER per substat
    let erSubsTotal = 0;
    let slotsWithErCount = 0;
    let erPenalty = 0;
    const slotHasErArray: boolean[] = [];

    // ARTIFACT LOOP 1 FOR ER COUNT
    for (let i = 0; i < artifacts.length; i++) {
      const artifact = orderedArtifacts[i];
      // Skip gear without Reliquary tag
      if (!artifact.reliquary) {
        continue;
      }
      if (artifact.flat.reliquarySubstats.length < 4) {
        continue;
      }
      let hasER = false;
      artifact.flat.reliquarySubstats.forEach((stat) => {
        const substatType = stat.appendPropId as string;
        if (substatType == "FIGHT_PROP_CHARGE_EFFICIENCY") {
          erSubsTotal += stat.statValue;
          hasER = true;
          slotHasErArray.push(true);
          slotsWithErCount++;
        }
      });
      if (hasER == false) {
        slotHasErArray.push(false);
      }
    }

    const erSubsEqvCount = // For when total ER can be reached with fewer rolls
      Math.ceil(
        Math.round(
          (erSubsTotal / maxStatRoll["FIGHT_PROP_CHARGE_EFFICIENCY"].maxValue) *
            10
        ) / 10
      );
    if (erSubsEqvCount > rollsNeeded) {
      erPenalty = (erSubsEqvCount - rollsNeeded) / slotsWithErCount;
      // Eg 2 extra rolls, 4 slots -> 0.5 * max stat ceiling boost
    }

    const thisCharactersRVs = [];
    const thisCalcBreakdown: string[] = []; // Shown on hover label
    let characterTotal = 0; // Average gear score

    // ARTIFACT LOOP 2 MAIN
    for (let i = 0; i < artifacts.length; i++) {
      const artifact = orderedArtifacts[i];
      const breakdownSlotCalcArray: string[] = [];
      let discountRollsER = 0; // No. of rolls rounded up

      // Skip gear without Reliquary tag
      if (!artifact.reliquary) {
        continue;
      }
      if (artifact.flat.reliquarySubstats.length < 4) {
        console.log("Missing substat on ${target}'s artifact slot:${i}");
        continue;
      }

      // SUBSTAT LOOP
      const rv = artifact.flat.reliquarySubstats
        .map((stat) => {
          // Gets substat index to find character specific substat weight
          const substatType = stat.appendPropId as string;
          const substatIndex = Object.keys(maxStatRoll).indexOf(substatType);
          const substatWeight = charWeights.weights[substatIndex] ?? 0;

          // Substat eqv no. of max rolls
          // TODO: Test for rounding errors with high # of rolls
          const subMaxRollEqv =
            Math.round(
              (stat.statValue / maxStatRoll[substatType].maxValue) * 10
            ) / 10;

          if (
            substatType == "FIGHT_PROP_CHARGE_EFFICIENCY" &&
            charWeights.energyNeeded > 0
          ) {
            //erSubsTotal += stat.statValue; // Add to ER running total
            discountRollsER = Math.ceil(subMaxRollEqv); // Array of ER rolls to discount
            // If ER needed, all ER rolls discounted, then penalty added back for overcap later
          }

          // String explaining RV calc eg 3.2xCDMG
          if (substatWeight > 0) {
            // Only adding if weight > 0
            breakdownSlotCalcArray.push(
              `${subMaxRollEqv.toFixed(1)}*${
                maxStatRoll[stat.appendPropId].name
              }(${substatWeight})`
            );
          }
          return subMaxRollEqv * substatWeight;
        })
        .reduce((a, b) => a + b, 0);
      // SUBSTAT LOOP END

      // Find the index of the main stat
      const mainStat = artifact.flat.reliquaryMainstat.mainPropId as string;
      const mainStatIndex = Object.keys(maxStatRoll).indexOf(mainStat);

      // Get indices of 4 highest substat multipliers that aren't the main stat or ER
      const highestIndices: number[] = [];
      const highestWeights: string[] = [];
      for (let i = 0; i < 4; i++) {
        let maxIndex: number = -1;
        let maxValue: number = Number.MIN_SAFE_INTEGER;
        for (let j = 0; j < charWeights.weights.length; j++) {
          if (
            j !== mainStatIndex &&
            j !== 8 && // Deals with ER RV separately
            !highestIndices.includes(j) &&
            charWeights.weights[j] > maxValue
          ) {
            maxValue = charWeights.weights[j];
            maxIndex = j;
          }
        }
        if (maxIndex !== -1) {
          highestIndices.push(maxIndex);
          highestWeights.push();
        }
      }

      // If 6 ER rolls, then 1 of top weights indices 1,2 only
      let thisRVMax =
        (7 - discountRollsER) * charWeights.weights[highestIndices[0]] +
        charWeights.weights[highestIndices[1]] +
        charWeights.weights[highestIndices[2]] +
        charWeights.weights[8] * discountRollsER; // Non-zero if ER contributes to DMG

      let rvSlotPenalty = 0;
      if (slotHasErArray[i]) {
        // If slot has ER, apply penalty if penalty not zero
        thisRVMax +=
          (erPenalty *
            (charWeights.weights[highestIndices[0]] *
              charWeights.weights[highestIndices[1]])) / // Penalty RV is average of top 2 subs
          2;
        rvSlotPenalty = erPenalty; // Not zero if slot has ER
      }

      let lastStatMultiplier = 0;
      // If no ER, then can add 4th highest stat
      if (discountRollsER == 0) {
        thisRVMax += charWeights.weights[highestIndices[3]];
        lastStatMultiplier = 1;
      }

      thisCharactersRVs.push(((rv / thisRVMax) * 100).toFixed(0));
      characterTotal += (rv / thisRVMax) * 100;

      // Calc breakdown for this artifact eg 2.2*CR + 0.8*CDMG + 0.7*ATK%
      try {
        // Add this artifact calc breakdown
        let combinedString = breakdownSlotCalcArray[0];
        for (let i = 1; i < breakdownSlotCalcArray.length; i++) {
          combinedString += " + ";
          combinedString += breakdownSlotCalcArray[i];
        }
        let hoverLabel = `This Artifact: ${combinedString} = ${rv.toFixed(
          1
        )}\n`;

        // If this artifact has an ER substat, show reduced ceiling
        if (discountRollsER > 0) {
          hoverLabel += `Lowering ceiling for ${discountRollsER} ER substats\n`;

          // If this build has extra ER rolls -> adding back discounted rolls
          if (rvSlotPenalty > 0) {
            hoverLabel += `Distributed penalty for excess ER: ${rvSlotPenalty.toFixed(
              1
            )}*Best weight(${
              charWeights.weights[highestIndices[0]]
            })\nAssuming ${
              erSubsEqvCount - rollsNeeded // Extra ER rolls across build
            } ER roll(s) can be replaced with best stat\n`;
            // Better if we count the stats eg 3 slots with 18CR(ie maxed best stat), 2CDMG, etc so have to use CDMG instead
          }

          // Will have at least 1 discount roll in this condition body
          else {
            hoverLabel += `RV Ceiling: ${7 - discountRollsER}*${
              statNames[highestIndices[0]]
            }`;
            // Now ER may need to replace the 4th substat in the Perfect RV for slot calc, if it isn't there already
          }
        }
        // If 0 ER, "6x best stat" ceiling
        else {
          hoverLabel += `RV Ceiling: 6*${statNames[highestIndices[0]]}(${
            charWeights.weights[highestIndices[0]]
          })`;
        }

        hoverLabel +=
          ` + 1*${statNames[highestIndices[1]]}` +
          ` + 1*${statNames[highestIndices[2]]}`;
        if (lastStatMultiplier > 0) {
          hoverLabel += ` + ${lastStatMultiplier}*${
            statNames[highestIndices[3]]
          }`;
        }
        if (charWeights.weights[8] > 0 && discountRollsER > 0) {
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
