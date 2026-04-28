// /Commands/utils/stats.js

const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const color = require('colors');
const db = require('../../Modules/database');
const { format } = require('date-fns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Afficher les statistiques du bot.'),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const time = format(new Date(), 'HH:mm:ss');

        try {
            const serverCount = interaction.client.guilds.cache.size;

            const [activeChannels] = await db.pool.execute(
                `SELECT COUNT(*) as count FROM temp_channels`
            );

            const [configuredServers] = await db.pool.execute(
                `SELECT COUNT(*) as count FROM servers`
            );

            const botLatency = Date.now() - interaction.createdTimestamp;
            const apiLatency = Math.round(interaction.client.ws.ping);

            const embed = new EmbedBuilder()
                .setTitle('📊 Statistiques du bot')
                .addFields(
                    { name: '🌍 Serveurs', value: `> ${serverCount}`, inline: true },
                    { name: '⚙️ Serveurs configurés', value: `> ${configuredServers[0].count}`, inline: true },
                    { name: '🎙️ Salons actifs', value: `> ${activeChannels[0].count}`, inline: true },
                    { name: '🏓 Latence bot', value: `> ${botLatency}ms`, inline: true },
                    { name: '📡 Latence API', value: `> ${apiLatency}ms`, inline: true },
                )
                .setColor(0xf9cb3d)
                .setFooter({ text: `Demandé par ${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(color.red(`[ERROR ${time}] An error occurred in /stats:`), error);
            return interaction.editReply({
                content: '`🙁` Une erreur est survenue lors de la récupération des statistiques.',
            });
        }
    }
};