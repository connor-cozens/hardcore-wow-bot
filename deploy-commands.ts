import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { SlashCommandBuilder } from '@discordjs/builders';
import dotenv from 'dotenv';
import { WoWRace, WoWClass, raceClassMap } from './src/models/raceClassMap.js';

dotenv.config();

// Load environment variables based on the developer mode
const isDeveloperMode = process.env.DEVELOPER_MODE === 'true';
const DISCORD_TOKEN = isDeveloperMode ? process.env.DEV_DISCORD_TOKEN : process.env.PROD_DISCORD_TOKEN;
const CLIENT_ID = isDeveloperMode ? process.env.DEV_CLIENT_ID : process.env.PROD_CLIENT_ID;
const GUILD_ID = isDeveloperMode ? process.env.DEV_GUILD_ID : process.env.PROD_GUILD_ID;

// Convert race types to choices format
const races = Object.keys(raceClassMap).map(race => ({
    name: race,
    value: race
}));

const statuses = [
    { name: 'alive', value: 'alive' },
    { name: 'dead', value: 'dead' }
];

const commands = [
    new SlashCommandBuilder()
        .setName('createdeadpool')
        .setDescription('Create a new Deadpool competition')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of the Deadpool')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('startdate')
                .setDescription('Start date (YYYY-MM-DD)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('enddate')
                .setDescription('End date (YYYY-MM-DD)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('prize')
                .setDescription('Prize description')
                .setRequired(false)),
    new SlashCommandBuilder()
        .setName('editdeadpool')
        .setDescription('Edit an existing deadpool')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of the deadpool to edit')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('New description for the deadpool')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('prize')
                .setDescription('New prize amount for the deadpool')
                .setRequired(false)),
    new SlashCommandBuilder()
        .setName('createcharacter')
        .setDescription('Create a new character')
        .addStringOption(option => 
            option.setName('deadpool')
                .setDescription('Select the Deadpool to join')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Character name')
                .setRequired(true)
                .setMaxLength(20))
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
        .addUserOption(option =>
            option.setName('ownedby')
                .setDescription('Discord user who owns this character')
                .setRequired(false))
        .addStringOption(option => 
            option.setName('status')
                .setDescription('Character status')
                .addChoices(...statuses)
                .setRequired(false))
        .addIntegerOption(option => 
            option.setName('level')
                .setDescription('Character level')
                .setMinValue(1)
                .setMaxValue(60)
                .setRequired(false))
        .addStringOption(option => 
            option.setName('zone')
                .setDescription('Leveling zone')
                .setRequired(false)),
    new SlashCommandBuilder()
        .setName('editcharacter')
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
    new SlashCommandBuilder()
        .setName('list')
        .setDescription('List all current characters (Only to user.)'),
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