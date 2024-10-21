'use client';

interface Teams {
    [charName: string]: number[];
}

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

    getTeam(charName: string): number[] | undefined {
        return this.teams[charName];
    }

    updateTeam(charName: string, stats: number[]): void {
        this.teams[charName] = stats;
    }
}

export default weightsStartingTable;  