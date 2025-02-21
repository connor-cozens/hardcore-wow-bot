import { ChatInputCommandInteraction } from 'discord.js';
import { getActiveDeadpools } from '../models/deadpool.js';
import { getAllCharacters } from '../models/character.js';

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const activeDeadpools = getActiveDeadpools();
    
    if (activeDeadpools.length === 0) {
        await interaction.reply({ 
            content: '🎮 **Active Deadpools**\nNo active deadpools at the moment!', 
            ephemeral: true 
        });
        return;
    }

    let listMessage = '🎮 **Your Characters in Active Deadpools**\n\n';

    for (const deadpool of activeDeadpools) {
        const userCharacters = getAllCharacters()
            .filter(char => 
                char.deadpoolId === deadpool.id && 
                char.discordUserId === interaction.user.id
            )
            .sort((a, b) => b.level - a.level);

        if (userCharacters.length > 0) {
            const endDate = deadpool.endDate.toLocaleDateString();
            listMessage += `### 🏆 ${deadpool.name} (Ends: ${endDate})\n`;

            const alive = userCharacters.filter(char => char.status === 'alive');
            const dead = userCharacters.filter(char => char.status === 'dead');

            if (alive.length > 0) {
                listMessage += '**🌟 Your Active Characters:**\n';
                alive.forEach(char => {
                    listMessage += `• ${char.name} - Level ${char.level} ${char.race} ${char.class}\n`;
                });
                listMessage += '\n';
            }

            if (dead.length > 0) {
                listMessage += '**💀 Your Fallen Characters:**\n';
                dead.forEach(char => {
                    listMessage += `• ${char.name} - Level ${char.level} ${char.race} ${char.class}\n`;
                });
                listMessage += '\n';
            }

            listMessage += '─────────────────────────\n\n';
        }
    }

    if (listMessage === '🎮 **Your Characters in Active Deadpools**\n\n') {
        await interaction.reply({ 
            content: '🎮 **Your Characters**\nYou have no characters in any active deadpools!', 
            ephemeral: true 
        });
    } else {
        await interaction.reply({ content: listMessage, ephemeral: true });
    }
} 