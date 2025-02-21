import { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { getActiveDeadpools } from '../models/deadpool.js';
import { getAllCharacters } from '../models/character.js';
import { config } from '../config/environment.js';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const activeDeadpools = getActiveDeadpools();
    const channel = interaction.client.channels.cache.get(config.discord.announcementChannelId!) as TextChannel;
    
    if (activeDeadpools.length === 0) {
        const message = '🎮 **Active Deadpools**\nNo active deadpools at the moment!';
        await channel.send(message);
        await interaction.reply({ content: 'Summary sent to the announcement channel.', ephemeral: true });
        return;
    }

    let summaryMessage = '🎮 **Active Deadpools Summary**\n\n';

    for (const deadpool of activeDeadpools) {
        const deadpoolCharacters = getAllCharacters()
            .filter(char => char.deadpoolId === deadpool.id)
            .sort((a, b) => b.level - a.level);

        const startDate = new Date(deadpool.startDate).toLocaleDateString();
        const endDate = new Date(deadpool.endDate).toLocaleDateString();
        const prizeInfo = deadpool.prize ? `\n💰 Prize: ${deadpool.prize}` : '';

        summaryMessage += `### 🏆 ${deadpool.name}\n`;
        summaryMessage += `📅 Timeline: ${startDate} to ${endDate}${prizeInfo}\n\n`;

        if (deadpoolCharacters.length === 0) {
            summaryMessage += 'No characters registered yet!\n\n';
        } else {
            const alive = deadpoolCharacters.filter(char => char.status === 'alive');
            const dead = deadpoolCharacters.filter(char => char.status === 'dead');

            if (alive.length > 0) {
                summaryMessage += '**🌟 Active Characters:**\n';
                alive.forEach(char => {
                    summaryMessage += `• ${char.name} - Level ${char.level} ${char.race} ${char.class} (<@${char.discordUserId}>)\n`;
                });
                summaryMessage += '\n';
            }

            if (dead.length > 0) {
                summaryMessage += '**💀 Fallen Characters:**\n';
                dead.forEach(char => {
                    summaryMessage += `• ${char.name} - Level ${char.level} ${char.race} ${char.class} (<@${char.discordUserId}>)\n`;
                });
                summaryMessage += '\n';
            }
        }

        summaryMessage += '─────────────────────────\n\n';
    }

    await channel.send(summaryMessage);
    await interaction.reply({ content: 'Summary sent to the announcement channel.', ephemeral: true });
} 