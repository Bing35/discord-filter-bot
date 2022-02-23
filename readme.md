# Discord Filter Bot

This Discord bot filters profanities and replaces them by random words. Since a bot cannot edit users' messages, it will delete theirs and write messages itself. It will also mention the user in them.

## How to run

### Setup your environment variables

The application needs a discord bot token to run. Put it in the `DISCORD_TOKEN` environment variable.

`export DISCORD_TOKEN='SOMETOKEN'`

### Run the bot

`node app.mjs`