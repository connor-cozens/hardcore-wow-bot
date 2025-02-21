import { IDeadpool } from '../types/index.js';
import { getDeadpoolsMap } from '../services/storage.js';

let deadpools: Record<string, IDeadpool> = {};

export function initializeDeadpools(initialDeadpools?: Record<string, IDeadpool>) {
    deadpools = initialDeadpools || getDeadpoolsMap();
}

export function getDeadpool(id: string): IDeadpool | undefined {
    return deadpools[id];
}

export function setDeadpool(id: string, deadpool: IDeadpool): void {
    deadpools[id] = deadpool;
}

export function updateDeadpool(id: string, deadpool: IDeadpool): void {
    deadpools[id] = deadpool;
}

export function getActiveDeadpools(): IDeadpool[] {
    return Object.values(deadpools).filter(deadpool => deadpool.isActive);
} 