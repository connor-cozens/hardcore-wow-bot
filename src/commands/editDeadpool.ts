import { SlashCommandBuilder } from 'discord.js';
import { getDeadpool, updateDeadpool } from '../models/deadpool.js';

export const editDeadpool = new SlashCommandBuilder()
    .setName('editdeadpool')
    .setDescription('Edit an existing deadpool')
    .addStringOption(option =>
        option
            .setName('name')
            .setDescription('Name of the deadpool to edit')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('description')
            .setDescription('New description for the deadpool')
            .setRequired(false)
    )
    .addIntegerOption(option =>
        option
            .setName('prize')
            .setDescription('New prize amount for the deadpool')
            .setRequired(false)
    );

export async function executeEditDeadpool(interaction: any) {
    const deadpoolName = interaction.options.getString('name');
    const newPrize = interaction.options.getInteger('prize');

    try {
        const deadpool = await getDeadpool(deadpoolName);
        
        if (!deadpool) {
            await interaction.reply(`Deadpool "${deadpoolName}" not found.`);
            return;
        }

        if (newPrize !== null) {
            deadpool.prize = newPrize;
        }

        await updateDeadpool(deadpoolName, deadpool);
        
        await interaction.reply(`Successfully updated deadpool "${deadpoolName}"`);
    } catch (error) {
        console.error('Error editing deadpool:', error);
        await interaction.reply('There was an error while editing the deadpool.');
    }
} 