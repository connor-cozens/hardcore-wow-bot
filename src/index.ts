import { Client, GatewayIntentBits, Events, TextChannel, Interaction, AutocompleteInteraction, ChatInputCommandInteraction, InteractionType } from 'discord.js';
import dotenv from 'dotenv';
import cron from 'node-cron';
import fs from 'fs';

dotenv.config();

const DATA_FILE = 'characters.json';

// Load environment variables based on the developer mode
const isDeveloperMode = process.env.DEVELOPER_MODE === 'true';
const DISCORD_TOKEN = isDeveloperMode ? process.env.DEV_DISCORD_TOKEN : process.env.PROD_DISCORD_TOKEN;
const CLIENT_ID = isDeveloperMode ? process.env.DEV_CLIENT_ID : process.env.PROD_CLIENT_ID;
const GUILD_ID = isDeveloperMode ? process.env.DEV_GUILD_ID : process.env.PROD_GUILD_ID;
const ANNOUNCEMENT_CHANNEL_ID = isDeveloperMode ? process.env.DEV_ANNOUNCEMENT_CHANNEL_ID : process.env.PROD_ANNOUNCEMENT_CHANNEL_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

const raceClassMap = {
    'Human': ['Warrior', 'Paladin', 'Rogue', 'Priest', 'Mage', 'Warlock'],
    'Dwarf': ['Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest'],
    'Night Elf': ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Druid'],
    'Gnome': ['Warrior', 'Rogue', 'Mage', 'Warlock'],
    'Orc': ['Warrior', 'Hunter', 'Rogue', 'Warlock', 'Shaman'],
    'Tauren': ['Warrior', 'Hunter', 'Shaman', 'Druid'],
    'Troll': ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Mage', 'Shaman'],
    'Undead': ['Warrior', 'Rogue', 'Priest', 'Mage', 'Warlock']
};

// A map to store characters by their names.
const characters = new Map<string, {
    name: string;
    status: 'alive' | 'dead';
    level: number;
    class: string;
    race: string;
    levelingZone?: string;
}>();

// Load characters from the file
function loadCharacters() {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const parsedData = JSON.parse(data);
        for (const [key, value] of Object.entries(parsedData)) {
            characters.set(key, value as { name: string; status: 'alive' | 'dead'; level: number; class: string; race: string; levelingZone?: string });
        }
    }
}

// Save characters to the file
function saveCharacters() {
    const data = JSON.stringify(Object.fromEntries(characters), null, 2);
    fs.writeFileSync(DATA_FILE, data, 'utf8');
}

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    // Load characters from the file
    loadCharacters();

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
                if (name.length > 20) {
                    await interaction.reply('Character name must be 20 characters or less.');
                    deleteReplyAfterDelay(interaction);
                    return;
                }
                const status = options.getString('status')!;
                const level = options.getInteger('level')!;
                const charClass = options.getString('class')!;
                const race = options.getString('race')!;
                const levelingZone = options.getString('zone');

                if (!raceClassMap[race].includes(charClass)) {
                    await interaction.reply(`Invalid class for race ${race}.`);
                    deleteReplyAfterDelay(interaction);
                    return;
                }

                if (characters.has(name)) {
                    await interaction.reply(`Character "${name}" already exists.`);
                    deleteReplyAfterDelay(interaction);
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

                saveCharacters();

                await interaction.reply(`Character "${name}" created.`);
                deleteReplyAfterDelay(interaction);
                break;

            case 'edit':
                const editName = options.getString('name')!;
                const field = options.getString('field')!;
                const fieldValue = options.getString('value')!;

                if (field === 'name' && fieldValue.length > 20) {
                    await interaction.reply('Character name must be 20 characters or less.');
                    deleteReplyAfterDelay(interaction);
                    return;
                }

                const char = characters.get(editName);
                if (!char) {
                    await interaction.reply(`Character "${editName}" does not exist.`);
                    deleteReplyAfterDelay(interaction);
                    return;
                }

                if (field in char) {
                    if (field === 'level') {
                        const levelValue = parseInt(fieldValue, 10);
                        if (isNaN(levelValue) || levelValue < 1 || levelValue > 60) {
                            await interaction.reply('Invalid level value. Please enter a number between 1 and 60.');
                            deleteReplyAfterDelay(interaction);
                            return;
                        }
                        char.level = levelValue;
                    } else if (field === 'class') {
                        if (!raceClassMap[char.race].includes(fieldValue)) {
                            await interaction.reply(`Invalid class for race ${char.race}.`);
                            deleteReplyAfterDelay(interaction);
                            return;
                        }
                        char.class = fieldValue;
                    } else {
                        (char as any)[field] = fieldValue;
                    }
                    characters.set(editName, char);

                    saveCharacters();

                    await interaction.reply(`Character "${editName}" updated.`);
                    deleteReplyAfterDelay(interaction);

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
                    deleteReplyAfterDelay(interaction);
                }
                break;

            case 'levelup':
                const levelUpName = options.getString('name')!;
                const levelsToAdd = options.getInteger('levels')!;

                const character = characters.get(levelUpName);
                if (!character) {
                    await interaction.reply(`Character "${levelUpName}" does not exist.`);
                    deleteReplyAfterDelay(interaction);
                    return;
                }

                character.level = Math.min(60, character.level + levelsToAdd);
                characters.set(levelUpName, character);

                saveCharacters();

                await interaction.reply(`Character "${levelUpName}" is now level ${character.level}.`);
                deleteReplyAfterDelay(interaction);
                break;

            case 'summary':
                await sendDailySummary(interaction);
                deleteReplyAfterDelay(interaction);
                break;

            default:
                await interaction.reply(`Unknown command: ${commandName}`);
                deleteReplyAfterDelay(interaction);
                break;
        }
    } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply('There was an error while executing this command!');
            deleteReplyAfterDelay(interaction);
        }
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

function deleteReplyAfterDelay(interaction: ChatInputCommandInteraction, delay: number = 5000) {
    setTimeout(async () => {
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.deleteReply();
            }
        } catch (error) {
            console.error('Failed to delete reply:', error);
        }
    }, delay);
}

client.login(DISCORD_TOKEN);
