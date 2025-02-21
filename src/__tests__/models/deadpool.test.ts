import { getDeadpool, setDeadpool, getActiveDeadpools, initializeDeadpools } from '../../models/deadpool.js';
import { IDeadpool } from '../../types/index.js';

describe('Deadpool Model', () => {
    beforeEach(() => {
        // Reset the deadpools before each test
        initializeDeadpools({});
    });

    it('should set and get a deadpool correctly', () => {
        const testDeadpool: IDeadpool = {
            id: 'test-deadpool',
            name: 'Test Deadpool',
            description: 'Test Description',
            startDate: new Date(),
            endDate: new Date(),
            prize: 100,
            status: 'active',
            isActive: true
        };

        setDeadpool('test-deadpool', testDeadpool);
        expect(getDeadpool('test-deadpool')).toEqual(testDeadpool);
    });

    it('should return undefined for non-existent deadpool', () => {
        expect(getDeadpool('non-existent')).toBeUndefined();
    });

    it('should get only active deadpools', () => {
        const activeDeadpool: IDeadpool = {
            id: 'active-deadpool',
            name: 'Active Deadpool',
            description: 'Active Description',
            startDate: new Date(),
            endDate: new Date(),
            prize: 100,
            status: 'active',
            isActive: true
        };

        const inactiveDeadpool: IDeadpool = {
            ...activeDeadpool,
            id: 'inactive-deadpool',
            name: 'Inactive Deadpool',
            isActive: false
        };

        setDeadpool('active-deadpool', activeDeadpool);
        setDeadpool('inactive-deadpool', inactiveDeadpool);

        const activeDeadpools = getActiveDeadpools();
        expect(activeDeadpools.length).toBe(1);
        expect(activeDeadpools[0]).toEqual(activeDeadpool);
    });
}); 