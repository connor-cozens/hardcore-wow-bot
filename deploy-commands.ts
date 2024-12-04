import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { SlashCommandBuilder } from '@discordjs/builders';
import dotenv from 'dotenv';

dotenv.config();

// Load environment variables based on the developer mode
const isDeveloperMode = process.env.DEVELOPER_MODE === 'true';
const DISCORD_TOKEN = isDeveloperMode ? process.env.DEV_DISCORD_TOKEN : process.env.PROD_DISCORD_TOKEN;
const CLIENT_ID = isDeveloperMode ? process.env.DEV_CLIENT_ID : process.env.PROD_CLIENT_ID;
const GUILD_ID = isDeveloperMode ? process.env.DEV_GUILD_ID : process.env.PROD_GUILD_ID;

const races = [
    { name: 'Human', value: 'Human' },
    { name: 'Dwarf', value: 'Dwarf' },
    { name: 'Night Elf', value: 'Night Elf' },
    { name: 'Gnome', value: 'Gnome' },
    { name: 'Orc', value: 'Orc' },
    { name: 'Undead', value: 'Undead' },
    { name: 'Tauren', value: 'Tauren' },
    { name: 'Troll', value: 'Troll' }
];

const statuses = [
    { name: 'alive', value: 'alive' },
    { name: 'dead', value: 'dead' }
];

const commands = [
    new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create a new character')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Character name')
                .setRequired(true)
                .setMaxLength(20))
        .addStringOption(option => 
            option.setName('status')
                .setDescription('Character status')
                .setRequired(true)
                .addChoices(...statuses))
        .addIntegerOption(option => 
            option.setName('level')
                .setDescription('Character level')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(60))
        .addStringOption(option => 
            option.setName('race')
                .setDescription('Character race')
                .setRequired(true)
                .addChoices(...races))
        .addStringOption(option => 
            option.setName('class')
                .setDescription('Character class')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option => 
            option.setName('zone')
                .setDescription('Leveling zone')
                .setRequired(false)),
    new SlashCommandBuilder()
        .setName('edit')
        .setDescription('Edit an existing character')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Character name')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option => 
            option.setName('field')
                .setDescription('Field to edit')
                .setRequired(true)
                .addChoices(
                    { name: 'status', value: 'status' },
                    { name: 'level', value: 'level' },
                    { name: 'class', value: 'class' },
                    { name: 'race', value: 'race' },
                    { name: 'zone', value: 'zone' }
                ))
        .addStringOption(option => 
            option.setName('value')
                .setDescription('New value')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('summary')
        .setDescription('Get a summary of all characters that are still alive'),
    new SlashCommandBuilder()
        .setName('levelup')
        .setDescription('Increase a character\'s level')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Character name')
                .setRequired(true)
                .setAutocomplete(true))
        .addIntegerOption(option => 
            option.setName('levels')
                .setDescription('Number of levels to increase')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(60)),
    new SlashCommandBuilder()
        .setName('kill')
        .setDescription('Set a character\'s status to dead')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Character name')
                .setRequired(true)
                .setAutocomplete(true)),
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN!);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID!, GUILD_ID!),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();