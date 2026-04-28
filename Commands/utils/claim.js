// /Commands/utils/claim.js

const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const color = require('colors');
const db = require('../../Modules/database');
const { format } = require('date-fns');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('claim')
        .setDescription('Récupérer la propriété du salon vocal si le propriétaire est parti.'),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const time = format(new Date(), 'HH:mm:ss');
        const member = interaction.member;

        try {
            if (!member.voice.channelId) {
                return interaction.editReply({
                    content: '`🙁` Tu dois être dans un salon vocal pour utiliser cette commande.',
                });
            }

            const [rows] = await db.pool.execute(
                `SELECT channel_id, owner_id FROM temp_channels WHERE channel_id = ?`,
                [member.voice.channelId]
            );

            if (rows.length === 0) {
                return interaction.editReply({
                    content: '`🙁` Ce salon n\'est pas un salon vocal temporaire.',
                });
            }

            const { owner_id } = rows[0];

            if (owner_id === member.id) {
                return interaction.editReply({
                    content: '`🙁` Tu es déjà le propriétaire de ce salon vocal.',
                });
            }

            const channel = member.voice.channel;

            const ownerInChannel = channel.members.has(owner_id);
            if (ownerInChannel) {
                return interaction.editReply({
                    content: '`🙁` Le propriétaire est toujours dans le salon, tu ne peux pas claim le salon.',
                });
            }

            await channel.permissionOverwrites.edit(owner_id, {
                ManageChannels: null,
                MuteMembers: null,
                DeafenMembers: null,
                MoveMembers: null,
            });

            await channel.permissionOverwrites.edit(member.id, {
                ManageChannels: true,
                MuteMembers: true,
                DeafenMembers: true,
                MoveMembers: true,
            });

            await channel.setName(`Salon de ${member.user.displayName}`);

            await db.pool.execute(
                `UPDATE temp_channels SET owner_id = ? WHERE channel_id = ?`,
                [member.id, channel.id]
            );

            console.log(color.green(`[INFO ${time}] ${member.user.tag} claimed ownership of channel ${channel.id}`));
            return interaction.editReply({
                content: '`🔑` Tu es maintenant le propriétaire de ce salon vocal !',
            });

        } catch (error) {
            console.error(color.red(`[ERROR ${time}] An error occurred in /claim:`), error);
            return interaction.editReply({
                content: '`🙁` Une erreur est survenue lors de la récupération de la propriété.',
            });
        }
    }
};