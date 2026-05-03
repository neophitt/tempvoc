// /Commands/utils/unlock.js

const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const color = require('colors');
const db = require('../../Modules/database');
const { format } = require('date-fns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Déverrouiller votre salon vocal temporaire.'),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const time = format(new Date(), 'HH:mm:ss');
        const member = interaction.member;

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

            const channel = member.voice.channel;

            const everyonePerms = channel.permissionOverwrites.cache.get(interaction.guild.id);
            if (!everyonePerms?.deny.has(PermissionFlagsBits.Connect)) {
                return interaction.editReply({
                    content: '<:warning:1500502804714754048> Ton salon est déjà déverrouillé.',
                });
            }

            await channel.permissionOverwrites.edit(interaction.guild.id, {
                Connect: null, // null = reset the perm
            });

            console.log(color.green(`[INFO ${time}] ${member.user.tag} unlocked channel ${channel.id}`));
            return interaction.editReply({
                content: '<:unlocked:1500501930265411765> Ton salon vocal a été déverrouillé.',
            });

        } catch (error) {
            console.error(color.red(`[ERROR ${time}] An error occurred in /unlock:`), error);
            return interaction.editReply({
                content: '<:warning:1500502804714754048> Une erreur est survenue lors du déverrouillage du salon.',
            });
        }
    }
};