import dotenv from 'dotenv';

dotenv.config();

const isDeveloperMode = process.env.DEVELOPER_MODE === 'true';

function getEnvVar(devKey: string, prodKey: string): string {
    const value = isDeveloperMode ? process.env[devKey] : process.env[prodKey];
    if (!value) {
        throw new Error(`Environment variable ${isDeveloperMode ? devKey : prodKey} not found`);
    }
    return value;
}

export const config = {
    discord: {
        token: getEnvVar('DEV_DISCORD_TOKEN', 'PROD_DISCORD_TOKEN'),
        clientId: getEnvVar('DEV_CLIENT_ID', 'PROD_CLIENT_ID'),
        guildId: getEnvVar('DEV_GUILD_ID', 'PROD_GUILD_ID'),
        announcementChannelId: getEnvVar('DEV_ANNOUNCEMENT_CHANNEL_ID', 'PROD_ANNOUNCEMENT_CHANNEL_ID')
    },
    isDeveloperMode
} as const;

// Add a default export as an alternative
export default config; 