import { ICharacter } from '../types/index.js';
import { getCharactersMap } from '../services/storage.js';

let characters: Record<string, ICharacter> = {};

export function initializeCharacters(initialCharacters?: Record<string, ICharacter>) {
    characters = initialCharacters || getCharactersMap();
}

export function getCharacter(name: string): ICharacter | undefined {
    return characters[name];
}

export function setCharacter(name: string, character: ICharacter): void {
    characters[name] = character;
}

export function getAllCharacters(): ICharacter[] {
    return Object.values(characters);
}

// Remove the automatic initialization
// initializeCharacters(); 