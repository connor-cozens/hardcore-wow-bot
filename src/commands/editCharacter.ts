import { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { getCharacter, setCharacter } from '../models/character.js';
import { saveCharacters } from '../services/storage.js';
import { WoWRace, WoWClass, raceClassMap, isValidRaceClassCombo } from '../models/raceClassMap.js';
import { announceCharacterUpdate } from '../services/announcements.js';
import { config } from '../config/environment.js';
import { ICharacter } from '../types/index.js';

async function updateCharacterField(char: ICharacter, editName: string, field: string, value: any, channel: TextChannel, interaction: ChatInputCommandInteraction) {
    (char as any)[field] = value;
    setCharacter(editName, char);
    saveCharacters();
    await interaction.reply({ content: `Character "${editName}" updated.`, ephemeral: true });
    announceCharacterUpdate(channel, char, `changed ${field} to ${value}`);
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const editName = interaction.options.getString('name', true);
    const field = interaction.options.getString('field', true);
    const fieldValue = interaction.options.getString('value', true);

    if (field === 'name' && fieldValue.length > 20) {
        await interaction.reply({ content: 'Character name must be 20 characters or less.', ephemeral: true });
        return;
    }

    const char = getCharacter(editName);
    if (!char) {
        await interaction.reply({ content: `Character "${editName}" does not exist.`, ephemeral: true });
        return;
    }

    const channel = interaction.client.channels.cache.get(config.discord.announcementChannelId!) as TextChannel;

    if (field === 'level') {
        const levelValue = parseInt(fieldValue, 10);
        if (isNaN(levelValue) || levelValue < 1 || levelValue > 60) {
            await interaction.reply({ content: 'Invalid level value. Please enter a number between 1 and 60.', ephemeral: true });
            return;
        }
        await updateCharacterField(char, editName, field, levelValue, channel, interaction);
    } else if (field === 'status' && fieldValue === 'dead') {
        await updateCharacterField(char, editName, field, 'dead', channel, interaction);
    } else if (field === 'class') {
        const characterRace = char.race as WoWRace;
        const characterClass = fieldValue as WoWClass;
        if (!isValidRaceClassCombo(characterRace, characterClass)) {
            await interaction.reply({ content: `Invalid class for race ${char.race}.`, ephemeral: true });
            return;
        }
        await updateCharacterField(char, editName, field, fieldValue, channel, interaction);
    } else {
        await updateCharacterField(char, editName, field, fieldValue, channel, interaction);
    }
} 