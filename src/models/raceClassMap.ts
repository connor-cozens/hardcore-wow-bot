export type WoWClass = 
  | 'Warrior' 
  | 'Paladin' 
  | 'Hunter' 
  | 'Rogue' 
  | 'Priest' 
  | 'Mage' 
  | 'Warlock' 
  | 'Shaman' 
  | 'Druid';

export type WoWRace = 
  | 'Human' 
  | 'Dwarf' 
  | 'Night Elf' 
  | 'Gnome' 
  | 'Orc' 
  | 'Tauren' 
  | 'Troll' 
  | 'Undead';

export const raceClassMap: Record<WoWRace, WoWClass[]> = {
    'Human': ['Warrior', 'Paladin', 'Rogue', 'Priest', 'Mage', 'Warlock'],
    'Dwarf': ['Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest'],
    'Night Elf': ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Druid'],
    'Gnome': ['Warrior', 'Rogue', 'Mage', 'Warlock'],
    'Orc': ['Warrior', 'Hunter', 'Rogue', 'Warlock', 'Shaman'],
    'Tauren': ['Warrior', 'Hunter', 'Shaman', 'Druid'],
    'Troll': ['Warrior', 'Hunter', 'Rogue', 'Priest', 'Mage', 'Shaman'],
    'Undead': ['Warrior', 'Rogue', 'Priest', 'Mage', 'Warlock']
};

/**
 * Validates if a race/class combination is valid in World of Warcraft
 */
export function isValidRaceClassCombo(race: WoWRace, characterClass: WoWClass): boolean {
    return raceClassMap[race]?.includes(characterClass) ?? false;
} 