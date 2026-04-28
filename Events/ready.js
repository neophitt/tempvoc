require('dotenv').config({ quiet: true, debug: false });
const { Events, ActivityType } = require('discord.js');
const color = require('colors');
const { format } = require('date-fns');

function randomStatus(statusList) {
    return statusList[Math.floor(Math.random() * statusList.length)];
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const time = format(new Date(), 'HH:mm:ss');

        await require('../Modules/commandHandlers')(client);
        await require('../Modules/deployCommands')(client);
        await require('../Modules/cleanup')(client);

        console.log(color.green(`[INFO ${time}] Ready! Logged in as ${client.user.tag}`));

        const updateStatus = () => {
            const serversCount = client.guilds.cache.size;

            const status = [
                "✨ Utilisez /help pour obtenir du support!",
                "🙎‍♂️ Nous recrutons ! Rendez-vous sur discord.gg/aA4mtYsUQj",
                `🔥 Présent sur ${serversCount} serveurs`
            ];

            client.user.setActivity(randomStatus(status), { type: ActivityType.Custom });
        };

        updateStatus();
        setInterval(updateStatus, 5 * 60 * 1000); // Every 5 minutes
    }
};