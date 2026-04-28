// /Commands/utils/kick.js

const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const color = require('colors');
const db = require('../../Modules/database');
const { format } = require('date-fns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulser un utilisateur de votre salon vocal temporaire.')
        .addUserOption(option =>
            option
                .setName('utilisateur')
                .setDescription('L\'utilisateur à expulser du salon.')
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

            if (!target.voice.channelId || target.voice.channelId !== member.voice.channelId) {
                return interaction.editReply({
                    content: '`🙁` Cet utilisateur n\'est pas dans ton salon vocal.',
                });
            }

            if (target.id === member.id) {
                return interaction.editReply({
                    content: '`🙁` Tu ne peux pas t\'expulser toi-même.',
                });
            }

            await target.voice.disconnect();

            console.log(color.green(`[INFO ${time}] ${member.user.tag} kicked ${target.user.tag} from channel ${member.voice.channelId}`));
            return interaction.editReply({
                content: `\`👢\` **${target.user.displayName}** a été expulsé de ton salon vocal.`,
            });

        } catch (error) {
            console.error(color.red(`[ERROR ${time}] An error occurred in /kick:`), error);
            return interaction.editReply({
                content: '`🙁` Une erreur est survenue lors de l\'expulsion.',
            });
        }
    }
};