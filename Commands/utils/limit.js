// /Commands/utils/limit.js

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const color = require('colors');
const db = require('../../Modules/database');
const { format } = require('date-fns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limit')
        .setDescription('Définir une limite d\'utilisateurs dans votre salon vocal.')
        .addIntegerOption(option =>
            option
                .setName('limite')
                .setDescription('Nombre maximum d\'utilisateurs (0 = illimité)')
                .setMinValue(0)
                .setMaxValue(99)
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const time = format(new Date(), 'HH:mm:ss');
        const member = interaction.member;
        const limit = interaction.options.getInteger('limite');

        try {
            if (!member.voice.channelId) {
                return interaction.editReply({
                    content: '<:warning:1500502804714754048> Tu dois être dans un salon vocal pour utiliser cette commande.',
                });
            }

            const [rows] = await db.pool.execute(
                `SELECT channel_id FROM temp_channels WHERE channel_id = ? AND owner_id = ?`,
                [member.voice.channelId, member.id]
            );

            if (rows.length === 0) {
                return interaction.editReply({
                    content: '<:warning:1500502804714754048> Tu n\'es pas le propriétaire de ce salon vocal.',
                });
            }

            await member.voice.channel.setUserLimit(limit);

            const message = limit === 0
                ? '<:check:1500501456426373181> La limite d\'utilisateurs a été supprimée.'
                : `<:check:1500501456426373181> La limite a été définie à **${limit} utilisateur(s)**.`;

            console.log(color.green(`[INFO ${time}] ${member.user.tag} set limit to ${limit} in channel ${member.voice.channelId}`));
            return interaction.editReply({ content: message });

        } catch (error) {
            console.error(color.red(`[ERROR ${time}] An error occurred in /limit:`), error);
            return interaction.editReply({
                content: '<:warning:1500502804714754048> Une erreur est survenue lors de la modification de la limite.',
            });
        }
    }
};