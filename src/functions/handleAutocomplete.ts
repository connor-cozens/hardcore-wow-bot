import { AutocompleteInteraction } from "discord.js";
import { characters, raceClassMap } from "..";

export async function handleAutocomplete(interaction: AutocompleteInteraction) {
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
