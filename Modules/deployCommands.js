// /Modules/deployCommands.js

require('dotenv').config({ quiet: true, debug: false });
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const color = require('colors');
const { format } = require('date-fns')

module.exports = async (client) => {

    const time = format(new Date(), 'HH:mm:ss');
    const commands = [];
    const commandsPath = path.join(__dirname, '..', 'Commands');

    if (!fs.existsSync(commandsPath)) {
        console.log(color.red(`[WARN ${time}] The "Commands" folder cannot be found.`));
        return;
    }

    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {

        const folderPath = path.join(commandsPath, folder);
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const commandFiles = fs
            .readdirSync(folderPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {

            const filePath = path.join(folderPath, file);

            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);

            if ('data' in command && typeof command.data.toJSON === 'function') {
                commands.push(command.data.toJSON());
            } else {
                console.log(color.red(`[WARN ${time}] The ${file} command must have properties such as "data" and "execute."`));
            }
        }
    }

    if (!process.env.BOT_TOKEN) {
        console.log(color.red(`[WARN ${time}] The "BOT_TOKEN" variable is missing.`));
        return;
    }

    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

    try {

        console.log(color.green(`[INFO ${time}] Deploying ${commands.length} slash commands...`));


        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        console.log(
            color.green(`[INFO ${time}] ${commands.length} command(s) deployed globaly.`)
        );

    } catch (error) {
        console.error(color.red(`[ERROR ${time}] An error occurred when deploying commands: `), error);
    }
};