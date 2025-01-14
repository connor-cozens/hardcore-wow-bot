import { Client, GatewayIntentBits, Events, Interaction, AutocompleteInteraction, ChatInputCommandInteraction, InteractionType, TextChannel } from 'discord.js';
import dotenv from 'dotenv';
import cron from 'node-cron';
import fs from 'fs';

dotenv.config();

const DATA_FILE = 'characters.json';
const LOG_FILE = 'error.log';

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

// Log errors to a file
function logError(error: any) {
    const errorMessage = `[${new Date().toISOString()}] ${error.stack || error}\n`;
    fs.appendFileSync(LOG_FILE, errorMessage, 'utf8');
}

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    // Load characters from the file
    loadCharacters();

    // Schedule summary every 3 days at 10:00am EST
    cron.schedule('0 10 */3 * *', () => {
        sendDailySummary();
    }, {
        timezone: 'America/New_York'
    });
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    try {
        if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
            handleAutocomplete(interaction as AutocompleteInteraction);
        } else if (interaction.type === InteractionType.ApplicationCommand) {
            handleCommand(interaction as ChatInputCommandInteraction);
        }
    } catch (error) {
        logError(error);
        console.error('Error handling interaction:', error);
    }
});

async function handleAutocomplete(interaction: AutocompleteInteraction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices: string[] = [];

    if (focusedOption.name === 'name') {
        choices = Array.from(characters.keys());
    } else if (focusedOption.name === 'class') {
        const race = interaction.options.getString('race');
        if (race && raceClassMap[race]) {
            choices = raceClassMap[race];
        }
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
                    await interaction.reply({ content: 'Character name must be 20 characters or less.', ephemeral: true });
                    return;
                }
                const status = options.getString('status')!;
                const level = options.getInteger('level')!;
                const charClass = options.getString('class')!;
                const race = options.getString('race')!;
                const levelingZone = options.getString('zone');

                if (!raceClassMap[race].includes(charClass)) {
                    await interaction.reply({ content: `Invalid class for race ${race}.`, ephemeral: true });
                    return;
                }

                if (characters.has(name)) {
                    await interaction.reply({ content: `Character "${name}" already exists.`, ephemeral: true });
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

                await interaction.reply({ content: `Character "${name}" created.`, ephemeral: true });
                break;

            case 'edit':
                const editName = options.getString('name')!;
                const field = options.getString('field')!;
                const fieldValue = options.getString('value')!;

                if (field === 'name' && fieldValue.length > 20) {
                    await interaction.reply({ content: 'Character name must be 20 characters or less.', ephemeral: true });
                    return;
                }

                const char = characters.get(editName);
                if (!char) {
                    await interaction.reply({ content: `Character "${editName}" does not exist.`, ephemeral: true });
                    return;
                }

                if (field in char) {
                    if (field === 'level') {
                        const levelValue = parseInt(fieldValue, 10);
                        if (isNaN(levelValue) || levelValue < 1 || levelValue > 60) {
                            await interaction.reply({ content: 'Invalid level value. Please enter a number between 1 and 60.', ephemeral: true });
                            return;
                        }
                        char.level = levelValue;
                    } else if (field === 'class') {
                        if (!raceClassMap[char.race].includes(fieldValue)) {
                            await interaction.reply({ content: `Invalid class for race ${char.race}.`, ephemeral: true });
                            return;
                        }
                        char.class = fieldValue;
                    } else {
                        (char as any)[field] = fieldValue;
                    }
                    characters.set(editName, char);

                    saveCharacters();

                    await interaction.reply({ content: `Character "${editName}" updated.`, ephemeral: true });

                    if (field === 'level') {
                        const levelsToAdd = char.level - (char.level % 5);
                        const announcementChannel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID) as TextChannel;
                        for (let lvl = char.level - (char.level % 5); lvl <= char.level; lvl += 5) {
                            if (lvl > char.level - levelsToAdd) {
                                announcementChannel.send(`🎉 Character "${char.name}" has reached level ${lvl}!`);
                            }
                        }
                    }

                    if (field === 'status' && char.status === 'dead') {
                        const announcementChannel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID) as TextChannel;
                        announcementChannel.send(`⚰️ Character "${char.name}" has died.`);
                    }
                } else {
                    await interaction.reply({ content: `Invalid field: ${field}`, ephemeral: true });
                }
                break;

            case 'levelup':
                const levelUpName = options.getString('name')!;
                const levelsToAdd = options.getInteger('levels')!;

                const character = characters.get(levelUpName);
                if (!character) {
                    await interaction.reply({ content: `Character "${levelUpName}" does not exist.`, ephemeral: true });
                    return;
                }

                const oldLevel = character.level;
                character.level = Math.min(60, character.level + levelsToAdd);
                characters.set(levelUpName, character);

                saveCharacters();

                await interaction.reply({ content: `Character "${levelUpName}" is now level ${character.level}.`, ephemeral: true });

                const announcementChannel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID) as TextChannel;
                for (let lvl = oldLevel + 1; lvl <= character.level; lvl++) {
                    if (lvl % 5 === 0) {
                        announcementChannel.send(`🎉 Character "${character.name}" has reached level ${lvl}!`);
                    }
                }
                break;

            case 'kill':
                const killName = options.getString('name')!;

                const killCharacter = characters.get(killName);
                if (!killCharacter) {
                    await interaction.reply({ content: `Character "${killName}" does not exist.`, ephemeral: true });
                    return;
                }

                if (killCharacter.status === 'dead') {
                    await interaction.reply({ content: `Character "${killName}" is already dead.`, ephemeral: true });
                    return;
                }

                killCharacter.status = 'dead';
                characters.set(killName, killCharacter);

                saveCharacters();

                await interaction.reply({ content: `Character "${killName}" has been set to dead.`, ephemeral: true });

                const announcementChannelKill = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID) as TextChannel;
                announcementChannelKill.send(`⚰️ Character "${killCharacter.name}" has died.`);
                break;

            case 'summary':
                await sendDailySummary(interaction);
                break;

            default:
                await interaction.reply({ content: `Unknown command: ${commandName}`, ephemeral: true });
                break;
        }
    } catch (error) {
        logError(error);
        console.error('Error handling command:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}

async function sendDailySummary(interaction?: ChatInputCommandInteraction) {
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

process.on('unhandledRejection', (reason, promise) => {
    logError(reason);
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logError(error);
    console.error('Uncaught Exception:', error);
});

client.login(DISCORD_TOKEN);
