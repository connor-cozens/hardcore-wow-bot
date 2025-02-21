import { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { getCharacter, setCharacter } from '../models/character.js';
import { saveCharacters } from '../services/storage.js';
import { announceCharacterUpdate } from '../services/announcements.js';
import { config } from '../config/environment.js';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const killName = interaction.options.getString('name', true);

    const character = getCharacter(killName);
    if (!character) {
        await interaction.reply({ content: `Character "${killName}" does not exist.`, ephemeral: true });
        return;
    }

    if (character.status === 'dead') {
        await interaction.reply({ content: `Character "${killName}" is already dead.`, ephemeral: true });
        return;
    }

    character.status = 'dead';
    setCharacter(killName, character);
    saveCharacters();

    await interaction.reply({ content: `Character "${killName}" has been set to dead.`, ephemeral: true });

    const channel = interaction.client.channels.cache.get(config.discord.announcementChannelId!) as TextChannel;
    announceCharacterUpdate(channel, character, 'died');
} 