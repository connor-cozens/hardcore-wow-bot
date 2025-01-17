# Discord Bot for Hardcore WoW

This is a Discord bot for managing characters in a Hardcore WoW server. The bot allows users to create, edit, level up, and kill characters, as well as get a daily summary of alive characters.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Discord bot token
- A Google Cloud VM (optional, for deployment)

## Setup

1. Clone the repository:
   ```
   sh
   git clone https://github.com/yourusername/hardcore-wow-bot.git
   cd hardcore-wow-bot
   ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a .env file in the root directory with the following content:
    ```env
    # Common environment variables
    DEVELOPER_MODE=true

    # Development environment variables
    DEV_DISCORD_TOKEN=your_dev_discord_bot_token
    DEV_CLIENT_ID=your_dev_discord_client_id
    DEV_GUILD_ID=your_dev_discord_guild_id
    DEV_ANNOUNCEMENT_CHANNEL_ID=your_dev_announcement_channel_id

    # Production environment variables
    PROD_DISCORD_TOKEN=your_prod_discord_bot_token
    PROD_CLIENT_ID=your_prod_discord_client_id
    PROD_GUILD_ID=your_prod_discord_guild_id
    PROD_ANNOUNCEMENT_CHANNEL_ID=your_prod_announcement_channel_id
    ```
4. Update the values in the .env file with your actual Discord bot token, client ID, guild ID, and announcement channel ID.

# Commands
## Deploy Commands
### To deploy the bot's commands to Discord, run the following command:

```bash
npm run deploy-commands
```

### To start the Bot Locally

```bash
npm start
```

### Using `pm2` to Keep the Bot Running
1. Install `pm2` globally:
    ```bash
    sudo npm install -g pm2
    ```
    
2. Start the bot with `pm2`
    ```bash
    pm2 start dist/index.js --name "discord-bot"
    ```
    
3. Save the process list:
    ```bash
    pm2 save
    ```
    
4. Set `pm2` to start on boot:
    ```bash
    sudo pm2 startup
    ```
    
5. Follow the instructions provided by the `pm2` startup command to complete the setup.

## Logs
You can view the logs of your bot using the following command:
    ```bash
    pm2 logs discord-bot
    ```

## Bot Commands
**Create a Character**
```
/create name:<name> status:<status> level:<level> class:<class> race:<race> [zone:<zone>]
```

**Edit a Character**
```
/edit name:<name> field:<field> value:<value>
```

**Level a Character Up**
```
/levelup name:<name> levels:<levels>
```

**Kill a Character**
```
/kill name:<name>
```

## Show a list of all alive characters
```
/list
```

**Post Daily Summary to Channel**
```
/summmary
```

## Error Logging
Errors are logged to a file named error.log in the root directory. Check this file for details on any errors that occur.

## Troubleshooting
If the bot crashes or stops running, check the error.log file for details on the error. You can also use pm2 to keep the bot running continuously and automatically restart it if it crashes.

# Contributing
Feel free to submit issues or pull requests if you find any bugs or have suggestions for improvements.

# License
This project is licensed under the MIT License.

This [README.md](http://_vscodecontentref_/2) file provides detailed instructions on how to set up, test, deploy, and update the bot, as well as the commands to use and how to keep the bot running using `pm2`.
