// /Commands/moderation/reset.js

const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const color = require('colors');
const db = require('../../Modules/database');
const { format } = require('date-fns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Réinitialiser la configuration du bot pour votre serveur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const time = format(new Date(), 'HH:mm:ss');
        const guild = await interaction.guild.fetch();

        try {
            const [rows] = await db.pool.execute(
                `SELECT server_id FROM servers WHERE server_id = ?`,
                [guild.id]
            );

            if (rows.length === 0) {
                return interaction.editReply({
                    content: '<:warning:1500502804714754048> Ce serveur n\'est pas encore configuré, utilise `/setup` pour commencer.',
                });
            }

            const [tempChannels] = await db.pool.execute(
                `SELECT channel_id FROM temp_channels WHERE server_id = ?`,
                [guild.id]
            );

            for (const row of tempChannels) {
                const channel = guild.channels.cache.get(row.channel_id);
                if (channel) await channel.delete();
            }

            await db.pool.execute(`DELETE FROM temp_channels WHERE server_id = ?`, [guild.id]);

            await db.pool.execute(`DELETE FROM servers WHERE server_id = ?`, [guild.id]);

            console.log(color.yellow(`[INFO ${time}] Guild ${guild.id} configuration reset by ${interaction.user.tag}`));
            return interaction.editReply({
                content: '<:check:1500501456426373181> La configuration du bot a été réinitialisée. Utilise `/setup` pour reconfigurer le bot.',
            });

        } catch (error) {
            console.error(color.red(`[ERROR ${time}] An error occurred in /reset:`), error);
            return interaction.editReply({
                content: '<:warning:1500502804714754048> Une erreur est survenue lors de la réinitialisation.',
            });
        }
    }
};