import { CharacterDetail, StatProperty } from "genshin-manager";

interface Teams { [charName: string]: number[]; }

export default function calculateRVs(data: CharacterDetail[], teams: Teams) {

    const substatMaxValues = {
        "FIGHT_PROP_HP": 298.75,
        "FIGHT_PROP_ATTACK": 19.45,
        "FIGHT_PROP_DEFENSE": 23.15,
        "FIGHT_PROP_HP_PERCENT": 5.83,
        "FIGHT_PROP_ATTACK_PERCENT": 5.83,
        "FIGHT_PROP_DEFENSE_PERCENT": 7.29,
        "FIGHT_PROP_CRITICAL": 3.89,
        "FIGHT_PROP_CRITICAL_HURT": 7.77,
        "FIGHT_PROP_CHARGE_EFFICIENCY": 6.48,
        "FIGHT_PROP_ELEMENT_MASTERY": 23.31,
    }
    type SubstatKeys = keyof typeof substatMaxValues;

    const allCharacterRVs: (string | number)[][] = [];

    //Iterate through each character
    for (let j = 0; j < data.length; j++) {

        const target = data[j];
        const charName = target.name;
        const artifacts = target.artifacts;

        if (!teams.hasOwnProperty(charName)) {
            //console.log("Team multipliers not specified for ", charName);
            continue;
        }
        if (artifacts.length < 5) {
            //console.log("Missing artifacts for ", charName);
            continue;
        }

        const thisCharactersRVs = [];
        // Add the character name to the beginning of the RV array
        thisCharactersRVs.push(charName);
        let characterTotal = 0;

        for (let i = 0; i < 5; i++) {
            const rv = artifacts[i].subStats.map(statRaw => {
                const stat = statRaw as StatProperty
                const substatType = stat.type.toString() as SubstatKeys;
                //console.log(substatType);

                // Handle invalid substat type
                if (!(substatType in substatMaxValues)) {
                    console.error(`Invalid substat type: ${substatType}`);
                    return 0;
                }

                let multipliedStat = 0;
                if (stat.isPercent) {
                    multipliedStat = stat.value * 100
                }
                else {
                    multipliedStat = stat.value;
                }

                const substatIndex = Object.keys(substatMaxValues).indexOf(substatType);

                const meanValue = substatMaxValues[substatType] * 0.85;
                const multiplier = teams[charName]?.[substatIndex] ?? 0;

                return (multipliedStat / meanValue) * multiplier;
            })
                .reduce((a, b) => { return a + b; }, 0);

            //Max RV calc for this slot
            const removedSlot = [...teams[charName]];
            const slotType = artifacts[i].mainStat.type.toString() as SubstatKeys;
            if (Object.keys(substatMaxValues).indexOf(slotType) !== -1) { // Only slicing if mainstat not in keys
                removedSlot.splice(Object.keys(substatMaxValues).indexOf(slotType), 1);
                // console.log(i," slot mainstat is in keys for ",charName);
            }

            // Sorts the multipliers to find the 
            removedSlot.sort((a, b) => b - a);

            //Calc the max RV for this slot, scaled Mean roll increase to max
            const thisRVMax = (6 * removedSlot[0] + removedSlot[1] + removedSlot[2] + removedSlot[3]) / 0.85;
            //console.log(thisRVMax);
            thisCharactersRVs.push((rv / thisRVMax * 100).toFixed(0)); // Add artifact RV/max % to the line
            characterTotal += rv / thisRVMax * 100;
            //console.log(i, " ", rv.toFixed(0), "\t", thisRVMax.toFixed(0));
        }
        thisCharactersRVs.push((characterTotal / 5).toFixed(0));
        //console.log(thisCharactersRVs);
        allCharacterRVs.push(thisCharactersRVs);
        //console.log(characterTotal);
    }

    // Sort character list based on total RV score
    allCharacterRVs.sort((a, b) => {
        const numA = Number(a[6]);
        const numB = Number(b[6]);

        // Compare the numbers
        return numA - numB;
    });

    //const updatedTeams = teams;

    return allCharacterRVs;
}