import { TextChannel, ChatInputCommandInteraction } from 'discord.js';
import { ICharacter, IDeadpool } from '../types/index.js';
import { getDeadpool, setDeadpool } from '../models/deadpool.js';
import { getAllCharacters } from '../models/character.js';
import { saveDeadpools } from './storage.js';

export function announceCharacterUpdate(
    channel: TextChannel,
    character: ICharacter, 
    action: string
): void {
    const userMention = `<@${character.discordUserId}>`;
    
    channel.send(
        `${userMention}'s character ${character.name} has ${action}! ` +
        `\n\n${character.name} - Level ${character.level} ${character.race} ${character.class}`
    );

    checkDeadpoolCompletion(channel, character, action);
}

function checkDeadpoolCompletion(
    channel: TextChannel,
    character: ICharacter,
    action: string
): void {
    const deadpool = getDeadpool(character.deadpoolId ?? '');
    if (!deadpool?.isActive) return;

    if (character.level >= 60 || action === 'died') {
        const aliveCharacters = getAllCharacters().filter(char => 
            char.deadpoolId === character.deadpoolId && 
            char.status === 'alive'
        );

        if (character.level >= 60 || aliveCharacters.length === 1) {
            announceDeadpoolWinner(channel, deadpool, character.level >= 60 ? character : aliveCharacters[0]);
        }
    }
}

function announceDeadpoolWinner(
    channel: TextChannel,
    deadpool: IDeadpool,
    winner: ICharacter
): void {
    deadpool.isActive = false;
    deadpool.winnerId = winner.discordUserId;
    setDeadpool(deadpool.id, deadpool);
    saveDeadpools();

    const prizeAnnouncement = deadpool.prize ? `\nPrize: ${deadpool.prize}` : '';
    channel.send(
        `@everyone The Deadpool "${deadpool.name}" has ended!\n` +
        `Winner: <@${winner.discordUserId}> with character ${winner.name} ` +
        `(Level ${winner.level} ${winner.race} ${winner.class})${prizeAnnouncement}`
    );
}

export async function success(interaction: ChatInputCommandInteraction, message: string): Promise<void> {
    await interaction.reply(message);
}

export async function error(interaction: ChatInputCommandInteraction, message: string): Promise<void> {
    await interaction.reply({ content: message, ephemeral: true });
} 