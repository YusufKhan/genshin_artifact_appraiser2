export interface WeightsData {
  [id: string]: CharacterWeights;
}

export interface CharacterWeights {
  weights: number[];
  name: string;
}

export interface CharacterRollValues {
  rollValues: string[];
  name: string;
  id: string;
  calcBreakdown: string[];
}

export interface UserData {
  avatarInfoList: {
    avatarId: string;
    equipList: {
      itemId: number;
      reliquary: {
        appendPropIdList: number[];
      };
      flat: {
        equipType: string;
        setNameTextMapHash: string;
        reliquarySubstats: {
          appendPropId: string;
          statValue: number;
        }[];
        reliquaryMainstat: {
          mainPropId: string;
        };
      };
    }[];
  }[];
  ttl: number;
  timestamp: number;
}
