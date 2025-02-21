import fs from 'fs/promises';

export async function logError(error: Error | unknown): Promise<void> {
    const timestamp = new Date().toISOString();
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    const logEntry = `[${timestamp}] ${message}\n`;
    
    try {
        await fs.appendFile('error.log', logEntry, 'utf8');
    } catch (err) {
        console.error('Failed to write to error log:', err);
    }
} 