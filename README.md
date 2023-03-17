roboost
================
[![Discord](https://discordapp.com/api/guilds/761634353859395595/embed.png)](https://discord.gg/tJFNC5Y)
[![Continuous Integration](https://github.com/guidojw/roboost/actions/workflows/continuous-integration.yml/badge.svg)](https://github.com/guidojw/roboost/actions/workflows/continuous-integration.yml)
[![Continuous Delivery](https://github.com/guidojw/roboost/actions/workflows/continuous-delivery.yml/badge.svg)](https://github.com/guidojw/roboost/actions/workflows/continuous-delivery.yml)

Synchronises your Discord server boosters to your Roblox game's playtesters. In order to do this, your server boosters have to be verified with either [RoVer](https://rover.link) or [Bloxlink](https://blox.link) because the bot fetches their Roblox ID and username from there.
Users who are no longer boosting and whose Roblox IDs are not in the `IGNORE_USER_IDS` environment variable will be removed from your game's playtesters.

**Note** 
The bot you're going to do this with must have its `GUILD_MEMBERS` [intent](https://discord.com/developers/docs/topics/gateway#gateway-intents) enabled on the Discord Developer Portal. The Roblox cookie you use has to be from the account which is owner of the game.
 
## Prerequisites
* [Node.js](https://nodejs.org/en/download/current/) (with npm)
* [Yarn](https://yarnpkg.com/) (alternative to npm, not required)

## Installation
1. Install packages with `yarn install` or `npm install`.
2. Copy `.env.example` to `.env` and update the fields to reflect your environment.

## Usage
To start the bot, run: `yarn start` or `npm start`.
