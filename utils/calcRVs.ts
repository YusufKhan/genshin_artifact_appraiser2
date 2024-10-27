import { WeightsData, UserData, CharacterRollValues } from "./interfaces";

export function calculateRVs(data: UserData, weights: WeightsData) {
  const substatMaxValues = {
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
  type SubstatKeys = keyof typeof substatMaxValues;

  const allCharacterRVs: CharacterRollValues[] = [];

  //Iterate through each character
  for (let j = 0; j < data.avatarInfoList.length; j++) {
    const target = data.avatarInfoList[j];
    const artifacts = target.equipList;
    const charId = target.avatarId;

    if (!weights[charId]) {
      // Add default weights if not present
      weights[charId] = {
        weights: [0, 0.0, 0, 0.0, 0.0, 0, 2.3, 2.3, 0.0, 0.0],
        name: "Unknown char: Def weights \n" + charId,
      };
    }
    const charWeights = weights[charId];
    const charName = weights[target.avatarId]?.name || target.avatarId; // Get name from weights file

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
    let characterTotal = 0;

    for (let i = 0; i < artifacts.length; i++) {
      const artifact = orderedArtifacts[i];

      // Skip artifacts without reliquary
      if (!artifact.reliquary) {
        continue;
      }

      const rv = artifact.flat.reliquarySubstats
        .map((stat) => {
          const substatType = stat.appendPropId as SubstatKeys;

          if (!(substatType in substatMaxValues)) {
            console.error(`Invalid substat type: ${substatType}`);
            return 0;
          }

          const multipliedStat = stat.statValue;
          const substatIndex =
            Object.keys(substatMaxValues).indexOf(substatType);
          //const meanValue = substatMaxValues[substatType] * 0.85; // Was for when weights table was average roll
          const multiplier = charWeights.weights[substatIndex] ?? 0;

          return (multipliedStat / substatMaxValues[substatType]) * multiplier;
        })
        .reduce((a, b) => a + b, 0);

      const removedSlot = [...charWeights.weights];
      const slotType = artifact.flat.reliquaryMainstat
        .mainPropId as SubstatKeys;

      if (Object.keys(substatMaxValues).indexOf(slotType) !== -1) {
        removedSlot.splice(Object.keys(substatMaxValues).indexOf(slotType), 1);
      }

      removedSlot.sort((a, b) => b - a);
      const thisRVMax =
        6 * removedSlot[0] + removedSlot[1] + removedSlot[2] + removedSlot[3];
      thisCharactersRVs.push(((rv / thisRVMax) * 100).toFixed(0));
      characterTotal += (rv / thisRVMax) * 100;
    }

    thisCharactersRVs.push((characterTotal / 5).toFixed(0));
    //console.log(thisCharactersRVs);
    allCharacterRVs.push({
      rollValues: thisCharactersRVs,
      name: charName,
      id: charId,
    });
    //console.log(characterTotal);
  }

  // Sort character list based on total RV score
  allCharacterRVs.sort((a, b) => {
    const numA = Number(a.rollValues[a.rollValues.length - 1]);
    const numB = Number(b.rollValues[b.rollValues.length - 1]);
    // Compare the numbers
    return numA - numB;
  });

  //const updatedTeams = teams;

  return { allCharacterRVs, weights };
}
