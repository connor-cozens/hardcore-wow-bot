import { WoWClass, WoWRace, raceClassMap, isValidRaceClassCombo } from '../../models/raceClassMap.js';

describe('Race-Class Map', () => {
  describe('Valid Race-Class Combinations', () => {
    it('should validate correct Human class combinations', () => {
      expect(isValidRaceClassCombo('Human', 'Warrior')).toBe(true);
      expect(isValidRaceClassCombo('Human', 'Paladin')).toBe(true);
      expect(isValidRaceClassCombo('Human', 'Rogue')).toBe(true);
      expect(isValidRaceClassCombo('Human', 'Priest')).toBe(true);
      expect(isValidRaceClassCombo('Human', 'Mage')).toBe(true);
      expect(isValidRaceClassCombo('Human', 'Warlock')).toBe(true);
    });

    it('should validate correct Night Elf class combinations', () => {
      expect(isValidRaceClassCombo('Night Elf', 'Warrior')).toBe(true);
      expect(isValidRaceClassCombo('Night Elf', 'Hunter')).toBe(true);
      expect(isValidRaceClassCombo('Night Elf', 'Priest')).toBe(true);
      expect(isValidRaceClassCombo('Night Elf', 'Rogue')).toBe(true);
      expect(isValidRaceClassCombo('Night Elf', 'Druid')).toBe(true);
    });

    it('should validate correct Orc class combinations', () => {
      expect(isValidRaceClassCombo('Orc', 'Warrior')).toBe(true);
      expect(isValidRaceClassCombo('Orc', 'Hunter')).toBe(true);
      expect(isValidRaceClassCombo('Orc', 'Rogue')).toBe(true);
      expect(isValidRaceClassCombo('Orc', 'Shaman')).toBe(true);
      expect(isValidRaceClassCombo('Orc', 'Warlock')).toBe(true);
    });
  });

  describe('Invalid Race-Class Combinations', () => {
    it('should invalidate incorrect combinations', () => {
      expect(isValidRaceClassCombo('Human', 'Shaman')).toBe(false);
      expect(isValidRaceClassCombo('Orc', 'Paladin')).toBe(false);
      expect(isValidRaceClassCombo('Undead', 'Druid')).toBe(false);
      expect(isValidRaceClassCombo('Tauren', 'Rogue')).toBe(false);
    });

    it('should handle invalid race inputs', () => {
      expect(isValidRaceClassCombo('InvalidRace' as WoWRace, 'Warrior')).toBe(false);
    });

    it('should handle invalid class inputs', () => {
      expect(isValidRaceClassCombo('Human', 'InvalidClass' as WoWClass)).toBe(false);
    });
  });

  describe('Race-Class Map Structure', () => {
    it('should have all races defined', () => {
      const expectedRaces: WoWRace[] = [
        'Human', 'Dwarf', 'Night Elf', 'Gnome',
        'Orc', 'Undead', 'Tauren', 'Troll'
      ];
      
      expectedRaces.forEach(race => {
        expect(raceClassMap[race]).toBeDefined();
        expect(Array.isArray(raceClassMap[race])).toBe(true);
      });
    });

    it('should have valid class arrays for each race', () => {
      Object.values(raceClassMap).forEach(classes => {
        classes.forEach(className => {
          expect(typeof className).toBe('string');
        });
      });
    });
  });
}); 