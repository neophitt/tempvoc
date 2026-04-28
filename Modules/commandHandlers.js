// /Modules/commandHandlers.js

const { Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const color = require('colors');
const { format } = require('date-fns');

module.exports = async (client) => {
    const time = format(new Date(), 'HH:mm:ss');
    client.commands = new Collection();
    const commands = [];

    const commandsPath = path.join(__dirname, '..', 'Commands');

    if(!fs.existsSync(commandsPath)) {
        console.log(color.yellow(`[WARN ${time}] The commands folder does not exist. Creating it...`));
        fs.mkdirSync(commandsPath, { recursive: true });
        console.log(`[INFO ${time}] Commands folder created!`);
        return;
    }
    
    const commandFolder = fs.readdirSync(commandsPath);

    for(const folder of commandFolder) {
        const folderPath = path.join(commandsPath, folder);

        if(!fs.statSync(folderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for(const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const command = require(filePath);

            if('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
                // Leave this line commented out in production to prevent log spam.
                // console.log(color.green(`[INFO ${time}] Loaded command: ${command.data.name} (${folder})`));
            } else {
                console.log(color.red(`[WARN ${time}] The ${file} command must have properties such as "data" and "execute."`));
            }
        }
    }

    console.log(color.green(`[INFO ${time}] ${client.commands.size} command(s) loaded`));
}