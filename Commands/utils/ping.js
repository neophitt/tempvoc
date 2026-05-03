const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Affiche la latence du bot.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(interaction) {
        const response = await interaction.reply({
            content: '`📡` Mesure du ping en cours...',
            withResponse: true,
        });

        const message = response.resource.message;

        /*
        *  Check the message creation date
        *  (timestamp) minus the time
        *  the interaction was created (timestamp)
        *  Then calculate the exact ping for the DiscordJS REST API
        */
        const botPing = message.createdTimestamp - interaction.createdTimestamp;
        const apiPing = Math.round(interaction.client.ws.ping);

        await interaction.editReply({ // Modifier le message précédent avec les valeurs de ping
            content: `<:announce:1500503242415669479> **Pong !** \n└─ Latence bot :\`${botPing}\`ms`
        });
    },
};