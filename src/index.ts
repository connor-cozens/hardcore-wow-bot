import { Client, GatewayIntentBits, Events, Interaction, AutocompleteInteraction, ChatInputCommandInteraction, InteractionType, TextChannel } from 'discord.js';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { config } from './config/environment.js';
import { loadCharacters, loadDeadpools, getCharactersMap, getDeadpoolsMap } from './services/storage.js';
import { checkDeadpoolEndDates } from './services/deadpoolChecker.js';
import { logError } from './utils/logger.js';
import { raceClassMap, WoWRace, WoWClass } from './models/raceClassMap.js';
import { getActiveDeadpools } from './models/deadpool.js';
import { getAllCharacters, initializeCharacters } from './models/character.js';
import { initializeDeadpools } from './models/deadpool.js';

// Import commands
import * as createDeadpool from './commands/createDeadpool.js';
import * as createCharacter from './commands/createCharacter.js';
import * as editCharacter from './commands/editCharacter.js';
import * as levelup from './commands/levelup.js';
import * as kill from './commands/kill.js';
import * as summary from './commands/summary.js';
import * as list from './commands/list.js';
import { editDeadpool, executeEditDeadpool } from './commands/editDeadpool.js';

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    try {
        // Load characters and deadpools from files
        await loadCharacters();
        await loadDeadpools();
        
        // Initialize the models with the loaded data
        initializeCharacters();
        initializeDeadpools();
        
        // Log loaded data for verification
        const chars = getCharactersMap();
        const pools = getDeadpoolsMap();
        console.log('Loaded characters:', Object.keys(chars).length);
        console.log('Character details:', chars);
        console.log('Loaded deadpools:', Object.keys(pools).length);
        console.log('Deadpool details:', pools);

        // Schedule summary daily at 9:00am MST
        cron.schedule('0 9 * * *', () => {
            const channel = client.channels.cache.get(config.discord.announcementChannelId!) as TextChannel;
            summary.execute({ client, channel } as any);
        }, {
            timezone: 'America/Denver'
        });

        // Add end-of-day deadpool check at 11:59pm MST
        cron.schedule('59 23 * * *', () => {
            const channel = client.channels.cache.get(config.discord.announcementChannelId!) as TextChannel;
            checkDeadpoolEndDates(channel);
        }, {
            timezone: 'America/Denver'
        });
    } catch (error) {
        console.error('Error loading data:', error);
    }
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

    if (focusedOption.name === 'deadpool') {
        choices = getActiveDeadpools().map(dp => dp.name);
    } else if (focusedOption.name === 'name') {
        const deadpoolId = interaction.options.getString('deadpool');
        choices = getAllCharacters()
            .filter(char => !deadpoolId || char.deadpoolId === deadpoolId)
            .map(char => char.name);
    } else if (focusedOption.name === 'class') {
        const race = interaction.options.getString('race') as WoWRace | null;
        if (race && race in raceClassMap) {
            choices = raceClassMap[race] as WoWClass[];
        }
    }

    const filtered = choices.filter(choice => 
        choice.toLowerCase().startsWith(focusedOption.value.toLowerCase())
    );
    await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
}

async function handleCommand(interaction: ChatInputCommandInteraction) {
    try {
        switch (interaction.commandName) {
            case 'createdeadpool':
                await createDeadpool.execute(interaction);
                break;
            case 'createcharacter':
                await createCharacter.execute(interaction);
                break;
            case 'editcharacter':
                await editCharacter.execute(interaction);
                break;
            case 'levelup':
                await levelup.execute(interaction);
                break;
            case 'kill':
                await kill.execute(interaction);
                break;
            case 'summary':
                await summary.execute(interaction);
                break;
            case 'list':
                await list.execute(interaction);
                break;
            case 'editdeadpool':
                await executeEditDeadpool(interaction);
                break;
            default:
                await interaction.reply({ 
                    content: `Unknown command: ${interaction.commandName}`, 
                    ephemeral: true 
                });
        }
    } catch (error) {
        logError(error);
        console.error('Error handling command:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ 
                content: 'There was an error while executing this command!', 
                ephemeral: true 
            });
        }
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

client.login(config.discord.token);
