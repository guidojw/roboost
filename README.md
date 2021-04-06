update-booster-playtesters
================
[![Discord](https://discordapp.com/api/guilds/761634353859395595/embed.png)](https://discord.gg/tJFNC5Y)

Fetches the current boosters of your guild, gets their verification data from [RoVer](https://github.com/evaera/RoVer) or [Bloxlink](https://github.com/bloxlink/Bloxlink) and then adds these as playtesters to your game.
Playtesters who are no longer boosting and whose user IDs are not in the `EXCLUDE_IDS` array will be removed from the playtesters.

##### NOTE 
The bot you're going to do this with must have its `GUILD_MEMBERS` [intent](https://discord.com/developers/docs/topics/gateway#gateway-intents) enabled on the Discord Developer Portal!
The Roblox cookie you use has to be from the account which is owner of the game.
 
## Prerequisites
* [Node.js](https://nodejs.org/en/download/current/)

## Installation
1. Install prerequisites
2. Install packages with `npm install`
3. Copy the `.env.example` to `.env` and set the values
4. In `app.js`, change the constants (`UNIVERSE_ID`, `IGNORE_USERS`, `GUILD_ID` & `OUTPUT_CHANNEL_ID`) as desired

## Usage
To start, run:

    npm start
