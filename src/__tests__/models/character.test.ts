import { getCharacter, setCharacter, getAllCharacters, initializeCharacters } from '../../models/character.js';
import { ICharacter } from '../../types/index.js';

describe('Character Model', () => {
    beforeEach(() => {
        // Reset the characters before each test
        initializeCharacters({});
    });

    it('should set and get a character correctly', () => {
        const testCharacter: ICharacter = {
            name: 'TestChar',
            status: 'alive',
            level: 1,
            class: 'Warrior',
            race: 'Human',
            deadpoolId: 'test-deadpool',
            discordUserId: '123456789'
        };

        setCharacter('TestChar', testCharacter);
        expect(getCharacter('TestChar')).toEqual(testCharacter);
    });

    it('should return undefined for non-existent character', () => {
        expect(getCharacter('NonExistent')).toBeUndefined();
    });

    it('should get all characters', () => {
        const testCharacter: ICharacter = {
            name: 'TestChar',
            status: 'alive',
            level: 1,
            class: 'Warrior',
            race: 'Human',
            deadpoolId: 'test-deadpool',
            discordUserId: '123456789'
        };

        setCharacter('TestChar', testCharacter);
        expect(getAllCharacters()).toEqual([testCharacter]);
    });

    it('should filter dead characters', () => {
        const deadCharacter: ICharacter = {
            name: 'DeadChar',
            status: 'dead',
            level: 1,
            class: 'Warrior',
            race: 'Human',
            deadpoolId: 'test-deadpool',
            discordUserId: '123456789'
        };

        const aliveCharacter: ICharacter = {
            ...deadCharacter,
            name: 'AliveChar',
            status: 'alive'
        };

        setCharacter('DeadChar', deadCharacter);
        setCharacter('AliveChar', aliveCharacter);

        const allCharacters = getAllCharacters();
        const deadCharacters = allCharacters.filter(char => char.status === 'dead');
        const aliveCharacters = allCharacters.filter(char => char.status === 'alive');

        expect(deadCharacters.length).toBe(1);
        expect(aliveCharacters.length).toBe(1);
    });
}); 