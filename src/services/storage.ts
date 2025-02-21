import fs from 'fs/promises';
import path from 'path';
import { ICharacter, IDeadpool } from '../types/index.js';

type CharacterMap = Record<string, ICharacter>;
type DeadpoolMap = Record<string, IDeadpool>;

let characters: CharacterMap = {};
let deadpools: DeadpoolMap = {};

export async function loadCharacters(): Promise<void> {
    try {
        const filePath = path.join(process.cwd(), 'data', 'characters.json');
        console.log('Loading characters from:', filePath);
        const data = await fs.readFile(filePath, 'utf8');
        characters = JSON.parse(data);
        console.log('Successfully loaded characters');
    } catch (error) {
        console.error('Error loading characters:', error);
        characters = {};
    }
}

export async function saveCharacters(): Promise<void> {
    try {
        const data = JSON.stringify(characters, null, 2);
        await fs.writeFile('data/characters.json', data, 'utf8');
    } catch (error) {
        console.error('Failed to save characters:', error);
    }
}

export async function loadDeadpools(): Promise<void> {
    try {
        const filePath = path.join(process.cwd(), 'data', 'deadpools.json');
        console.log('Loading deadpools from:', filePath);
        const data = await fs.readFile(filePath, 'utf8');
        deadpools = JSON.parse(data);
        console.log('Successfully loaded deadpools');
    } catch (error) {
        console.error('Error loading deadpools:', error);
        deadpools = {};
    }
}

export async function saveDeadpools(): Promise<void> {
    try {
        const data = JSON.stringify(deadpools, null, 2);
        await fs.writeFile('data/deadpools.json', data, 'utf8');
    } catch (error) {
        console.error('Failed to save deadpools:', error);
    }
}

export function getCharactersMap(): CharacterMap {
    return characters;
}

export function getDeadpoolsMap(): DeadpoolMap {
    return deadpools;
} 