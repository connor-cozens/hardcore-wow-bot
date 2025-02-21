import { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { getCharacter, setCharacter } from '../models/character.js';
import { saveCharacters } from '../services/storage.js';
import { announceCharacterUpdate } from '../services/announcements.js';
import { config } from '../config/environment.js';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const levelUpName = interaction.options.getString('name', true);
    const levelsToAdd = interaction.options.getInteger('levels', true);

    const character = getCharacter(levelUpName);
    if (!character) {
        await interaction.reply({ content: `Character "${levelUpName}" does not exist.`, ephemeral: true });
        return;
    }

    const oldLevel = character.level;
    character.level = Math.min(60, character.level + levelsToAdd);
    setCharacter(levelUpName, character);
    saveCharacters();

    await interaction.reply({ content: `Character "${levelUpName}" is now level ${character.level}.`, ephemeral: true });

    const channel = interaction.client.channels.cache.get(config.discord.announcementChannelId!) as TextChannel;
    announceCharacterUpdate(channel, character, `leveled up to ${character.level}`);
} 