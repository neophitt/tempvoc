// /Commands/utils/unban.js

const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const color = require('colors');
const db = require('../../Modules/database');
const { format } = require('date-fns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Débannir un utilisateur de votre salon vocal temporaire.')
        .addUserOption(option =>
            option
                .setName('utilisateur')
                .setDescription('L\'utilisateur à débannir du salon.')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const time = format(new Date(), 'HH:mm:ss');
        const member = interaction.member;
        const target = interaction.options.getMember('utilisateur');

        try {
            if (!member.voice.channelId) {
                return interaction.editReply({
                    content: '`🙁` Tu dois être dans un salon vocal pour utiliser cette commande.',
                });
            }

            const [rows] = await db.pool.execute(
                `SELECT channel_id FROM temp_channels WHERE channel_id = ? AND owner_id = ?`,
                [member.voice.channelId, member.id]
            );

            if (rows.length === 0) {
                return interaction.editReply({
                    content: '`🙁` Tu n\'es pas le propriétaire de ce salon vocal.',
                });
            }

            const channel = member.voice.channel;

            const targetPerms = channel.permissionOverwrites.cache.get(target.id);
            if (!targetPerms?.deny.has(PermissionFlagsBits.Connect)) {
                return interaction.editReply({
                    content: `\`🙁\` **${target.user.displayName}** n'est pas banni de ton salon vocal.`,
                });
            }

            await channel.permissionOverwrites.edit(target.id, {
                Connect: null,
                ViewChannel: null,
            });

            console.log(color.green(`[INFO ${time}] ${member.user.tag} unbanned ${target.user.tag} from channel ${channel.id}`));
            return interaction.editReply({
                content: `\`✅\` **${target.user.displayName}** a été débanni de ton salon vocal.`,
            });

        } catch (error) {
            console.error(color.red(`[ERROR ${time}] An error occurred in /unban:`), error);
            return interaction.editReply({
                content: '`🙁` Une erreur est survenue lors du débannissement.',
            });
        }
    }
};