import { TextChannel } from 'discord.js';
import { getActiveDeadpools, setDeadpool } from '../models/deadpool.js';
import { getAllCharacters } from '../models/character.js';
import { announceCharacterUpdate } from './announcements.js';
import { saveDeadpools } from './storage.js';

export function checkDeadpoolEndDates(channel: TextChannel): void {
    const now = new Date();
    const activeDeadpools = getActiveDeadpools();

    for (const deadpool of activeDeadpools) {
        if (now > deadpool.endDate) {
            const deadpoolCharacters = getAllCharacters()
                .filter(char => 
                    char.deadpoolId === deadpool.id && 
                    char.status === 'alive'
                )
                .sort((a, b) => b.level - a.level);

            if (deadpoolCharacters.length > 0) {
                const winner = deadpoolCharacters[0];
                deadpool.isActive = false;
                deadpool.winnerId = winner.discordUserId;
                setDeadpool(deadpool.id, deadpool);
                saveDeadpools();

                announceCharacterUpdate(channel, winner, 'won the Deadpool due to end date');
            }
        }
    }
} 