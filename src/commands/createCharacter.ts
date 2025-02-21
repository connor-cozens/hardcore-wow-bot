import { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { getDeadpool } from '../models/deadpool.js';
import { getCharacter, setCharacter } from '../models/character.js';
import { saveCharacters } from '../services/storage.js';
import { WoWRace, WoWClass, raceClassMap, isValidRaceClassCombo } from '../models/raceClassMap.js';
import { announceCharacterUpdate } from '../services/announcements.js';
import { config } from '../config/environment.js';
import { ICharacter } from '../types/index.js';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const deadpoolId = interaction.options.getString('deadpool', true);
    const selectedDeadpool = getDeadpool(deadpoolId);
    
    if (!selectedDeadpool?.isActive) {
        await interaction.reply({ content: 'Invalid or inactive Deadpool selected', ephemeral: true });
        return;
    }

    const name = interaction.options.getString('name', true);
    if (name.length > 20) {
        await interaction.reply({ content: 'Character name must be 20 characters or less.', ephemeral: true });
        return;
    }

    const ownedByUser = interaction.options.getUser('ownedby');
    const discordUserId = ownedByUser ? ownedByUser.id : interaction.user.id;

    const status = interaction.options.getString('status') ?? 'alive';
    const level = interaction.options.getInteger('level') ?? 1;
    const charClass = interaction.options.getString('class', true) as WoWClass;
    const race = interaction.options.getString('race', true) as WoWRace;
    const levelingZone = interaction.options.getString('zone');

    if (!isValidRaceClassCombo(race, charClass)) {
        await interaction.reply({ 
            content: `${charClass} is not a valid class for ${race}.`, 
            ephemeral: true 
        });
        return;
    }

    if (getCharacter(name)) {
        await interaction.reply({ content: `Character "${name}" already exists.`, ephemeral: true });
        return;
    }

    const character = {
        name,
        status: status as 'alive' | 'dead',
        level,
        class: charClass,
        race,
        levelingZone,
        deadpoolId,
        discordUserId
    };

    setCharacter(name, character as ICharacter);
    saveCharacters();

    await interaction.reply({ content: `Character "${name}" created.`, ephemeral: true });

    const channel = interaction.client.channels.cache.get(config.discord.announcementChannelId!) as TextChannel;
    announceCharacterUpdate(channel, character as ICharacter, 'been created');
} 