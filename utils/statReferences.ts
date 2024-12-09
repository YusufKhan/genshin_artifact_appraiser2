export class StatReferences {
  public static maxStatRoll: {
    [key: string]: { name: string; maxValue: number };
  } = {
    FIGHT_PROP_HP: { name: "HP", maxValue: 298.75 }, // 298.75
    FIGHT_PROP_ATTACK: { name: "ATK", maxValue: 19.45 }, // 19.45
    FIGHT_PROP_DEFENSE: { name: "DEF", maxValue: 23.15 }, // 23.15
    FIGHT_PROP_HP_PERCENT: { name: "HP%", maxValue: 5.83 }, // 5.83
    FIGHT_PROP_ATTACK_PERCENT: { name: "ATK%", maxValue: 5.83 }, // 5.83
    FIGHT_PROP_DEFENSE_PERCENT: { name: "DEF%", maxValue: 7.29 }, // 7.29
    FIGHT_PROP_CRITICAL: { name: "CR", maxValue: 3.89 }, // 3.89
    FIGHT_PROP_CRITICAL_HURT: { name: "CDMG", maxValue: 7.77 }, // 7.77
    FIGHT_PROP_CHARGE_EFFICIENCY: { name: "ER", maxValue: 6.48 }, // 6.48
    FIGHT_PROP_ELEMENT_MASTERY: { name: "EM", maxValue: 23.31 }, // 23.31
  };

  public static statNames: string[] = [
    "HP",
    "ATK",
    "DEF",
    "HP%",
    "ATK%",
    "DEF%",
    "CR",
    "CDMG",
    "ER",
    "EM",
  ];
}
