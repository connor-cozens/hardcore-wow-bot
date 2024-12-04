import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { SlashCommandBuilder } from '@discordjs/builders';
import dotenv from 'dotenv';

dotenv.config();

const classes = [
    { name: 'Warrior', value: 'Warrior' },
    { name: 'Paladin', value: 'Paladin' },
    { name: 'Hunter', value: 'Hunter' },
    { name: 'Rogue', value: 'Rogue' },
    { name: 'Priest', value: 'Priest' },
    { name: 'Shaman', value: 'Shaman' },
    { name: 'Mage', value: 'Mage' },
    { name: 'Warlock', value: 'Warlock' },
    { name: 'Druid', value: 'Druid' }
];

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

const commands = [
    new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create a new character')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Character name')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('status')
                .setDescription('Character status')
                .setRequired(true)
                .addChoices(
                    { name: 'alive', value: 'alive' },
                    { name: 'dead', value: 'dead' }
                ))
        .addIntegerOption(option => 
            option.setName('level')
                .setDescription('Character level')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('class')
                .setDescription('Character class')
                .setRequired(true)
                .addChoices(...classes))
        .addStringOption(option => 
            option.setName('race')
                .setDescription('Character race')
                .setRequired(true)
                .addChoices(...races))
        .addStringOption(option => 
            option.setName('zone')
                .setDescription('Leveling zone')
                .setRequired(true)),
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
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();