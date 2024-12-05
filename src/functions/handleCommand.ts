import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { raceClassMap, characters, saveCharacters, client, ANNOUNCEMENT_CHANNEL_ID } from "..";
import { sendDailySummary } from './sendDailySummary';

export async function handleCommand(interaction: ChatInputCommandInteraction) {
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

                    if (field === 'level' && char.level % 5 === 0) {
                        const announcementChannel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID) as TextChannel;
                        announcementChannel.send(`🎉 Character "${char.name}" has reached level ${char.level}!`);
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

                character.level = Math.min(60, character.level + levelsToAdd);
                characters.set(levelUpName, character);

                saveCharacters();

                await interaction.reply({ content: `Character "${levelUpName}" is now level ${character.level}.`, ephemeral: true });
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

                const announcementChannel = client.channels.cache.get(ANNOUNCEMENT_CHANNEL_ID) as TextChannel;
                announcementChannel.send(`⚰️ Character "${killCharacter.name}" has died.`);
                break;

            case 'summary':
                await sendDailySummary(interaction);
                break;

            default:
                await interaction.reply({ content: `Unknown command: ${commandName}`, ephemeral: true });
                break;
        }
    } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}
