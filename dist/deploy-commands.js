import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { SlashCommandBuilder } from '@discordjs/builders';
import dotenv from 'dotenv';
dotenv.config();
const commands = [
    new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create a new character')
        .addStringOption(option => option.setName('name').setDescription('Character name').setRequired(true))
        .addStringOption(option => option.setName('status').setDescription('Character status').setRequired(true))
        .addIntegerOption(option => option.setName('level').setDescription('Character level').setRequired(true))
        .addStringOption(option => option.setName('class').setDescription('Character class').setRequired(true))
        .addStringOption(option => option.setName('race').setDescription('Character race').setRequired(true))
        .addStringOption(option => option.setName('zone').setDescription('Leveling zone').setRequired(true)),
    new SlashCommandBuilder()
        .setName('edit')
        .setDescription('Edit an existing character')
        .addStringOption(option => option.setName('name').setDescription('Character name').setRequired(true))
        .addStringOption(option => option.setName('field').setDescription('Field to edit').setRequired(true))
        .addStringOption(option => option.setName('value').setDescription('New value').setRequired(true)),
].map(command => command.toJSON());
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.error(error);
    }
})();
