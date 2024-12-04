import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});
// A map to store characters by their names.
const characters = new Map();
const ANNOUNCEMENT_CHANNEL_ID = '877681811256410136'; // Replace with your channel ID.
client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    const { commandName, options } = interaction;
    switch (commandName) {
        case 'create':
            const name = options.getString('name');
            const status = options.getString('status');
            const level = options.getInteger('level');
            const charClass = options.getString('class');
            const race = options.getString('race');
            const levelingZone = options.getString('zone');
            if (characters.has(name)) {
                await interaction.reply(`Character "${name}" already exists.`);
                return;
            }
            characters.set(name, {
                name,
                status: status,
                level,
                class: charClass,
                race,
                levelingZone,
            });
            await interaction.reply(`Character "${name}" created.`);
            break;
        case 'edit':
            const editName = options.getString('name');
            const field = options.getString('field');
            const fieldValue = options.getString('value');
            const char = characters.get(editName);
            if (!char) {
                await interaction.reply(`Character "${editName}" does not exist.`);
                return;
            }
            if (field in char) {
                char[field] = field === 'level' ? parseInt(fieldValue, 10) : fieldValue;
                characters.set(editName, char);
                await interaction.reply(`Character "${editName}" updated.`);
                if (field === 'level' && char.level % 5 === 0) {
                    const announcementChannel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID);
                    announcementChannel.send(`🎉 Character "${char.name}" has reached level ${char.level}!`);
                }
                if (field === 'status' && char.status === 'dead') {
                    const announcementChannel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID);
                    announcementChannel.send(`⚰️ Character "${char.name}" has died.`);
                }
            }
            else {
                await interaction.reply(`Invalid field: ${field}`);
            }
            break;
    }
});
client.login(process.env.DISCORD_TOKEN);
