import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { characters, client, ANNOUNCEMENT_CHANNEL_ID } from "..";


export async function sendDailySummary(interaction?: ChatInputCommandInteraction) {
    const aliveCharacters = Array.from(characters.values()).filter(char => char.status === 'alive');
    const sortedCharacters = aliveCharacters.sort((a, b) => b.level - a.level);
    const summary = sortedCharacters.map(char => `${char.name} (Level ${char.level} ${char.race} ${char.class})`).join('\n');

    const announcementChannel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID) as TextChannel;
    if (summary) {
        await announcementChannel.send(`**Daily Summary of Alive Characters:**\n${summary}`);
    } else {
        await announcementChannel.send(`**Daily Summary of Alive Characters:**\nNo characters are currently alive.`);
    }

    if (interaction) {
        await interaction.reply({ content: 'Summary sent to the announcement channel.', ephemeral: true });
    }
}
