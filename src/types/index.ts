import { WoWClass, WoWRace } from '../models/raceClassMap.js';

export interface ICharacter {
    name: string;
    race: WoWRace;
    class: WoWClass;
    level: number;
    status: string;
    deadpoolId: string | null;
    discordUserId: string;
}

export interface IDeadpool {
    id: string;
    name: string;
    description: string;
    prize: number;
    startDate: Date;
    endDate: Date;
    status: string;
    isActive: boolean;
    winnerId?: string;
} 