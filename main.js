// /main.js

require('dotenv').config({ quiet: true, debug: false });
const { Client, GatewayIntentBits, partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const color = require('colors');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
	],
});

const eventsPath = path.join(__dirname, 'Events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
        console.log(color.green(`📁 → Executed event: ${event.name} (once)`));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
        console.log(color.green(`📁 → Executed event: ${event.name} (on)`));
    }
}

client.login(process.env.BOT_TOKEN);