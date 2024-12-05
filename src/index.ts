import { Client, GatewayIntentBits, Events, Interaction, AutocompleteInteraction, ChatInputCommandInteraction, InteractionType } from 'discord.js';
import dotenv from 'dotenv';
import cron from 'node-cron';
import fs from 'fs';
import { handleAutocomplete } from './functions/handleAutocomplete';
import { handleCommand } from './functions/handleCommand';
import { sendDailySummary } from './functions/sendDailySummary';

dotenv.config();

const DATA_FILE = 'characters.json';
const LOG_FILE = 'error.log';

// Load environment variables based on the developer mode
const isDeveloperMode = process.env.DEVELOPER_MODE === 'true';
const DISCORD_TOKEN = isDeveloperMode ? process.env.DEV_DISCORD_TOKEN : process.env.PROD_DISCORD_TOKEN;
const CLIENT_ID = isDeveloperMode ? process.env.DEV_CLIENT_ID : process.env.PROD_CLIENT_ID;
const GUILD_ID = isDeveloperMode ? process.env.DEV_GUILD_ID : process.env.PROD_GUILD_ID;
export const ANNOUNCEMENT_CHANNEL_ID = isDeveloperMode ? process.env.DEV_ANNOUNCEMENT_CHANNEL_ID : process.env.PROD_ANNOUNCEMENT_CHANNEL_ID;

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

export const raceClassMap = {
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
export const characters = new Map<string, {
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
export function saveCharacters() {
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

process.on('unhandledRejection', (reason, promise) => {
    logError(reason);
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logError(error);
    console.error('Uncaught Exception:', error);
});

client.login(DISCORD_TOKEN);
