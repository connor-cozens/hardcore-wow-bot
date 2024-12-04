import { Client, GatewayIntentBits, Events, TextChannel, Interaction, AutocompleteInteraction, ChatInputCommandInteraction, InteractionType } from 'discord.js';
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

// A map to store characters by their names.
const characters = new Map<string, {
    name: string;
    status: 'alive' | 'dead';
    level: number;
    class: string;
    race: string;
    levelingZone: string;
}>();

// const ANNOUNCEMENT_CHANNEL_ID = '877681811256410136'; // Replace with your channel ID.
const ANNOUNCEMENT_CHANNEL_ID = '757642351089811486'; // Replace with your channel ID.

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    // Schedule daily summary at 9:00am
    cron.schedule('0 9 * * *', () => {
        sendDailySummary();
    });
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
        handleAutocomplete(interaction as AutocompleteInteraction);
    } else if (interaction.type === InteractionType.ApplicationCommand) {
        handleCommand(interaction as ChatInputCommandInteraction);
    }
});

async function handleAutocomplete(interaction: AutocompleteInteraction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices: string[] = [];

    if (focusedOption.name === 'name') {
        choices = Array.from(characters.keys());
    }

    const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedOption.value.toLowerCase()));
    await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
}

async function handleCommand(interaction: ChatInputCommandInteraction) {
    const { commandName, options } = interaction;

    try {
        switch (commandName) {
            case 'create':
                const name = options.getString('name')!;
                const status = options.getString('status')!;
                const level = options.getInteger('level')!;
                const charClass = options.getString('class')!;
                const race = options.getString('race')!;
                const levelingZone = options.getString('zone')!;

                if (characters.has(name)) {
                    await interaction.reply(`Character "${name}" already exists.`);
                    return;
                }

                characters.set(name, {
                    name,
                    status: status as 'alive' | 'dead',
                    level,
                    class: charClass,
                    race,
                    levelingZone,
                });

                await interaction.reply(`Character "${name}" created.`);
                break;

            case 'edit':
                const editName = options.getString('name')!;
                const field = options.getString('field')!;
                const fieldValue = options.getString('value')!;

                const char = characters.get(editName);
                if (!char) {
                    await interaction.reply(`Character "${editName}" does not exist.`);
                    return;
                }

                if (field in char) {
                    (char as any)[field] = field === 'level' ? parseInt(fieldValue, 10) : fieldValue;
                    characters.set(editName, char);

                    await interaction.reply(`Character "${editName}" updated.`);

                    if (field === 'level' && char.level % 5 === 0) {
                        const announcementChannel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID) as TextChannel;
                        announcementChannel.send(`🎉 Character "${char.name}" has reached level ${char.level}!`);
                    }

                    if (field === 'status' && char.status === 'dead') {
                        const announcementChannel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID) as TextChannel;
                        announcementChannel.send(`⚰️ Character "${char.name}" has died.`);
                    }
                } else {
                    await interaction.reply(`Invalid field: ${field}`);
                }
                break;

            case 'summary':
                await sendDailySummary(interaction);
                break;

            default:
                await interaction.reply(`Unknown command: ${commandName}`);
                break;
        }
    } catch (error) {
        console.error(error);
        await interaction.reply('There was an error while executing this command!');
    }
}

async function sendDailySummary(interaction?: ChatInputCommandInteraction) {
    const aliveCharacters = Array.from(characters.values()).filter(char => char.status === 'alive');
    const summary = aliveCharacters.map(char => `${char.name} (Level ${char.level} ${char.race} ${char.class})`).join('\n');

    const announcementChannel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID) as TextChannel;
    if (summary) {
        await announcementChannel.send(`**Daily Summary of Alive Characters:**\n${summary}`);
    } else {
        await announcementChannel.send(`**Daily Summary of Alive Characters:**\nNo characters are currently alive.`);
    }

    if (interaction) {
        await interaction.reply('Summary sent to the announcement channel.');
    }
}

client.login(process.env.DISCORD_TOKEN);
