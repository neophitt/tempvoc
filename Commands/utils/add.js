// /Commands/utils/add.js

require('dotenv').config({ debug: false, quiet: true });
const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Ajouter le bot à votre serveur.'),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const embed = new EmbedBuilder()
            .setTitle('<:announce:1500503242415669479> Ajouter TempVoc')
            .setDescription('Clique sur le lien ci-dessous pour ajouter TempVoc à ton serveur !')
            .addFields(
                { name: `<:dot:1500504398835482654> Lien d\'invitation', value: '[Cliquer ici pour inviter le bot](${process.env.BOT_URL})` },
                { name: `<:dot:1500504398835482654> Support', value: '[Rejoindre le serveur de support](${process.env.SUPPORT_SERVER})` }
            )
            .setColor(0x5865F2)
            .setFooter({ text: `Demandé par ${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};