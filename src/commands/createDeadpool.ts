import { ChatInputCommandInteraction } from 'discord.js';
import { getDeadpool, setDeadpool } from '../models/deadpool.js';
import { saveDeadpools } from '../services/storage.js';
import { IDeadpool } from '../types/index.js';
import * as announcements from '../services/announcements.js';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name', true);
    const startDate = new Date(interaction.options.getString('startdate', true));
    const endDate = new Date(interaction.options.getString('enddate', true));
    const prize = interaction.options.getString('prize');

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        await announcements.error(interaction, 'Invalid date format. Use YYYY-MM-DD');
        return;
    }

    if (startDate >= endDate) {
        await announcements.error(interaction, 'Start date must be before end date');
        return;
    }

    if (getDeadpool(name)) {
        await announcements.error(interaction, 'A Deadpool with this name already exists');
        return;
    }

    const deadpool = {
        id: name,
        name,
        description: interaction.options.getString('description') ?? '',
        startDate,
        endDate,
        prize: prize ? parseInt(prize, 10) : 0,
        status: 'active',
        isActive: true
    };

    setDeadpool(name, deadpool);
    saveDeadpools();
    await announcements.success(interaction, `Created Deadpool "${name}"`);
}